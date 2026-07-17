# vue_babylon_hono_postgres 詳細設計

## 1. 目的

`report.md` の結論に基づき、`vue_hono_postgres` に Babylon.js を追加した汎用Web 3Dテンプレートを提供する。
Vueと3Dエンジンを直接結合せず、UI・サーバー状態と毎フレームの描画状態を分離する。

達成する要件:

- アプリケーションコードをTypeScriptで統一する
- WebGLを標準にしつつ、WebGPUへ段階的に移行できる
- Vueのmount / unmount / HMRでGPUリソースをリークしない
- glTF / GLBを後から追加できる
- 既存の認証、CRUD、OpenAPI、PostgreSQL、MinIO機能を維持する
- 物理、GUI、XRなどを必要なプロジェクトだけが追加できる

初期テンプレートの非目標:

- Vueコンポーネントで3Dノードを宣言的に記述すること
- 物理エンジン、WebXR、Inspectorを標準バンドルすること
- 3Dアセットやdecoderを外部CDNへ依存させること
- 毎フレームの座標をPiniaやVueのreactive stateで管理すること

## 2. システム構成

```text
┌─────────────────────────────────────────────────────────┐
│ Browser                                                 │
│                                                         │
│  Vue View                                               │
│    ├─ Pinia ──────────────── HTTP ───────────────┐      │
│    └─ BabylonCanvas.vue                         │      │
│          │ mount / resize / visibility / dispose│      │
│          ▼                                      │      │
│       BabylonRenderer                           │      │
│          ├─ AbstractEngine                      │      │
│          ├─ Scene                               │      │
│          └─ render loop                         │      │
└─────────────────────────────────────────────────│──────┘
                                                  ▼
                                        Hono + OpenAPI + Zod
                                          ├─ PostgreSQL
                                          └─ MinIO
```

データフロー:

1. Vue / Pinia が認証情報、アイテム、画像メタデータをHono APIから取得する。
2. HonoはZodスキーマでHTTP境界を検証し、Kysely経由でPostgreSQLへアクセスする。
3. 画像本体はpresigned URLを利用してMinIOへ保存する。
4. 3Dシーンのフレーム更新はBabylon.jsのrender loop内だけで行う。
5. UIに共有すべき低頻度のイベントだけをVueへemitする。

## 3. フロントエンド責務

### 3.1 `BabylonCanvas.vue`

Vueとレンダラーの境界であり、次だけを担当する。

- `HTMLCanvasElement` の参照
- `onMounted` でのレンダラー初期化
- `ResizeObserver` による描画サイズ更新
- Page Visibility APIによるバックグラウンド描画停止
- 初期化中・初期化失敗・使用中バックエンドの表示
- `onUnmounted` でのobserver、event listener、rendererの破棄

Babylon.jsオブジェクトは深いVueリアクティビティを必要としないため、`shallowRef` で保持する。

### 3.2 `BabylonRenderer`

Canvasの外側から利用する命令的なRenderingAdapterであり、次を所有する。

- Babylon `AbstractEngine`
- Babylon `Scene`
- render loop callback
- glTF asset container

公開操作:

| メソッド | 契約 |
|---|---|
| `initialize()` | EngineとSceneを一度初期化し、利用バックエンド情報を返す |
| `resize()` | Canvasの表示サイズ変更をEngineへ通知する |
| `setSuspended()` | render loopを停止・再開する |
| `loadGltf()` | glTF / GLBをAssetContainerとして読み込み、Sceneへ追加する |
| `dispose()` | render loop、Scene、Engineを冪等に破棄する |

初期化中にVueがunmountされた場合も、遅れて生成されたEngineを即座に破棄する。

### 3.3 `createEngine.ts`

バックエンド選択をScene構築から分離する。

| 指定値 | 動作 |
|---|---|
| `webgl` または未指定 | `Engine` を同期生成 |
| `webgpu` かつ対応 | `WebGPUEngine` を動的importして非同期生成 |
| `webgpu` かつ未対応 | `Engine` へフォールバック |
| `webgpu` 初期化失敗 | 警告を記録し、`Engine` へフォールバック |

戻り値は `AbstractEngine` とバックエンド情報に統一し、SceneコードがWebGL / WebGPUの違いを意識しないようにする。

### 3.4 `createDemoScene.ts`

テンプレートの最小動作例として以下を作成する。

- ArcRotateCameraとポインター操作
- HemisphericLightとPointLight
- StandardMaterialを持つ軽量なデモメッシュ
- ground mesh
- `onBeforeRenderObservable` によるフレーム時間ベースの回転

Vue stateは参照せず、毎フレーム更新をScene内に閉じ込める。

## 4. 状態の所有権

| 状態 | 所有者 | 更新頻度 | 例 |
|---|---|---:|---|
| 認証・一覧・フォーム | Vue / Pinia | イベント単位 | user、items、images |
| Canvas lifecycle | Vue component | mount / resize単位 | status、renderer info |
| Scene object | BabylonRenderer | 初期化・破棄単位 | camera、light、mesh |
| Animation state | Babylon Scene | 毎フレーム | rotation、particle |
| 永続データ | Hono / PostgreSQL | API request単位 | users、items |
| binary object | MinIO | upload / delete単位 | images、将来のGLB |

毎フレームの値をVueへ同期すると、不要なcomponent renderとGCを招くため禁止する。
座標をUIへ表示する場合は、必要な頻度へthrottleしたsnapshotだけをemitする。

## 5. アセット読み込み

`@babylonjs/loaders/glTF` とScene Loaderは `loadGltf()` 呼び出し時に動的importする。
これにより、標準デモだけを表示する利用者はloader chunkを取得しない。

本番アセット運用では次を追加する。

1. GLB / glTF、texture、decoderのMIME typeを配信元で明示する。
2. 外部URLを許可する場合はCORSとContent Security Policyを設定する。
3. ファイルサイズ、拡張子だけでなく内容をサーバー側で検証する。
4. Draco / KTX2 decoderを利用する場合は、バージョンを固定してセルフホストする。
5. 読み込み中の進捗、キャンセル、失敗UIをユースケース側で追加する。
6. 不要になったAssetContainerをremove / disposeする。

## 6. バンドル設計

採用パッケージ:

- `@babylonjs/core`: Engine、Scene、Camera、Light、Mesh、Material
- `@babylonjs/loaders`: glTF / GLB

標準では追加しないもの:

- `@babylonjs/gui`
- `@babylonjs/inspector`
- `@babylonjs/havok`

importは `@babylonjs/core` のroot namespaceではなく、機能単位のESM pathを使う。
Renderer本体、WebGPU、loaderはdynamic import境界を維持する。PBRマテリアルは
glTFロード時またはユースケース側で追加し、初期デモへ強制しない。
Viteのbuild結果でchunk構成とサイズを確認する。

## 7. エラーとフォールバック

| 障害 | 動作 |
|---|---|
| WebGPU未対応 | WebGLへ切り替え、captionに表示 |
| WebGPU初期化失敗 | consoleへ原因を記録しWebGLへ切り替え |
| WebGLも初期化不可 | Canvas上にエラーを表示し `error` eventをemit |
| glTF読み込み失敗 | Promiseをrejectし、呼び出し側が再試行・UI表示 |
| Vue unmount中の初期化完了 | 生成されたEngineを即時dispose |

認証やAPIのエラー処理は既存Pinia storeの責務を維持し、renderer errorと混在させない。

## 8. 性能・リソース管理

- device pixel ratioはEngineの `adaptToDeviceRatio` を利用する。
- タブが非表示ならrender loopを止める。
- resizeはwindow eventではなく対象CanvasのResizeObserverで検知する。
- animationはdelta timeを利用し、frame rateに依存させない。
- Sceneを破棄してからEngineを破棄する。
- HMRとroute遷移を繰り返してもevent listenerを残さない。
- 大きなモデルはAssetContainer単位でload / unloadする。
- 本番では実機別にdraw call、active meshes、texture memoryを計測する。

## 9. API・DB・ストレージ

Hono、Zod OpenAPI、Kysely、PostgreSQL、MinIOの構成は参照テンプレートと同じである。
3Dモデルを永続化する派生では、既存images機能を直接流用せず、assets domainを追加する。

推奨する将来のasset metadata:

```text
assets
  id
  owner_id
  object_key
  original_name
  mime_type
  byte_size
  checksum
  validation_status
  created_at
  updated_at
```

API responseは生のMinIO credentialではなく、短時間のpresigned URLまたは配信用URLを返す。

## 10. セキュリティ

- 本番ではJWT secret、DB password、MinIO credentialをsecret管理へ移す。
- アップロードサイズとMIME typeをフロントエンドだけで信頼しない。
- 3D asset parserへの入力は未信頼データとして扱う。
- remote textureやexternal URIを含むglTFの許可ポリシーを決める。
- CSPの `connect-src`、`img-src`、必要に応じて `worker-src` を限定する。
- WebGPU / WebGLの失敗詳細は利用者向けUIへそのまま露出しない。

## 11. 検証方針

静的検証:

- frontend: `npm run build`（vue-tsc + Vite）
- frontend: `npm run knip`
- backend: `npm run build`
- backend: `npm test`（外部MinIOへ接続しないunit test）
- compose: `docker compose config`

ブラウザ検証:

1. WebGLでSceneが描画され、camera操作できる。
2. Canvas resize後に縦横比が維持される。
3. route遷移とHMR後にrender loopが重複しない。
4. background tabで描画が停止し、復帰後に再開する。
5. WebGPU指定時に対応環境ではWebGPU、非対応環境ではWebGLになる。
6. context lost / restored後もEngine標準処理で復帰する。
7. reduced motion、keyboard focus、mobile pointer操作を確認する。

将来E2Eを追加する場合は、Canvasのpixel完全一致ではなく、
初期化状態、engine backend、Sceneのmesh数、重大console errorの有無を検証する。

## 12. 拡張手順

### 独自Sceneへ置換

`createDemoScene.ts` をdomain別のScene factoryへ差し替える。
`BabylonRenderer` のlifecycle契約は維持する。

### GUIを追加

`@babylonjs/gui` を明示追加し、3D内UIだけに利用する。
業務フォームやアクセシビリティが必要な操作はVue DOM側に残す。

### 物理を追加

`@babylonjs/havok` とWASMを追加し、初期化を非同期化する。
WASMをアプリと同一originから配信し、versionを固定する。

### WebXRを追加

HTTPS、権限、対応device、session終了時のresource解放を別途設計する。
通常画面のWebGL / WebGPU表示とXR sessionを同じVue stateへ過剰に結合しない。
