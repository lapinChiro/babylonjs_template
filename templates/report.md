# WebGLライブラリ選定レポート

- 調査日: 2026年7月17日
- 対象: PostgreSQL + Hono + React/Vueで構成するWebアプリケーションテンプレート
- 前提: アプリケーションコードをTypeScriptに統一し、型検査とLintによる静的解析を活用する

## 1. 結論

本テンプレートの標準レンダリングエンジンには、**Babylon.jsを採用するのが最も妥当**である。

特に次の要件と整合する。

- ReactとVueのどちらを採用するか、まだ確定していない
- アプリケーションコードをTypeScriptに統一したい
- glTF、PBR、アニメーション、物理演算、GUI、WebXRなどを後から追加できる汎用テンプレートにしたい
- WebGLとの互換性を維持しながら、将来的なWebGPU移行にも備えたい
- 多数の外部ライブラリを組み合わせるより、一貫したAPIと公式ツールを優先したい

ただし、フロントエンドフレームワークが確定している場合は、次の選択肢も有力である。

- Reactを採用し、Reactコンポーネントとして3Dシーンを構築するDXを最優先する場合: **Three.js + React Three Fiber**
- Vueを採用し、VueのリアクティビティやSFCとの統合を最優先する場合: **Three.js + TresJS**
- ECS、ゲーム機能、ブラウザ上のビジュアルEditorを重視する場合: **PlayCanvas Engine**

## 2. 評価基準

本テンプレートへの適合度を、以下の重みで評価した。

| 評価軸 | 重み | 評価内容 |
|---|---:|---|
| TypeScript・静的解析 | 25% | 型定義の品質、実装言語、型の追従性 |
| 3D機能・生産性 | 20% | glTF、PBR、アニメーション、物理、XR、デバッグ |
| React/Vue統合 | 15% | 宣言的記述、ライフサイクル、HMR、DevTools |
| エコシステム | 15% | ドキュメント、サンプル、拡張、利用者規模 |
| 性能・バンドル制御 | 10% | tree shaking、低レベル制御、モバイル対応 |
| WebGPU将来性 | 10% | WebGPUバックエンド、WebGLフォールバック |
| 保守性・ライセンス | 5% | 開発活動、破壊的変更、商用利用条件 |

星はライブラリ自体の一般的な品質ではなく、**今回のテンプレートへの適合度**を示す。

## 3. 本命候補の星取表

| 候補 | TS | 3D機能 | FE統合 | エコシステム | 性能 | WebGPU | 保守性 | 総合 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Babylon.js** | ★★★★★ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★★ | **4.5** |
| **PlayCanvas Engine** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★★ | **4.5** |
| **Three.js + React Three Fiber** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ | **4.3** |
| **Three.js + TresJS** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★☆ | **4.2** |
| **Three.js単体** | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★★★ | **3.8** |

## 4. 本命候補の詳細評価

### 4.1 Babylon.js

#### 概要

Babylon.jsは単純なレンダラーではなく、ブラウザ向けの統合3Dエンジンである。

WebGL 1/2、WebGPU、PBR、アニメーション、パーティクル、WebXR、Havok物理、GUI、3D Tiles、Gaussian Splatting、Node Material、Inspectorなどを公式機能として提供している。

参考:

- [Babylon.js Engine Specifications](https://www.babylonjs.com/specifications/)
- [Babylon.js公式リポジトリ](https://github.com/BabylonJS/Babylon.js/)

#### 長所

- 本体リポジトリの大部分がTypeScriptで実装されている
- npmパッケージが完全な型定義を提供する
- `@babylonjs/core`、`@babylonjs/loaders`、`@babylonjs/gui`など、機能単位にパッケージが分割されている
- ES Modulesとtree shakingに対応する
- Inspector、Node Material Editorなど、公式デバッグ・制作ツールが充実している
- ReactやVueに依存しないため、フロントエンドフレームワーク変更の影響を抑えやすい
- 物理、XR、ゲームパッド、音声などを一貫したAPIで追加できる
- WebGLを維持しながらWebGPUへ段階的に移行できる
- Apache 2.0ライセンスで商用利用しやすい

本番構成では、モノリシックな`babylonjs`パッケージではなく、tree-shake可能な`@babylonjs/*`パッケージを使用する。

参考:

- [Babylon.js ES6 support with Tree Shaking](https://doc.babylonjs.com/setup/frameworkPackages/es6Support)

#### 短所

- React/Vueとの宣言的統合はThree.js系ほど強くない
- React向け`react-babylonjs`は公式コアではなくコミュニティ拡張である
- 統合エンジンであるため、簡単な表現だけを行う場合はAPIと機能が過剰になりやすい
- 不適切なimport方法を使うとバンドルが大きくなりやすい

参考:

- [Babylon.js and React](https://doc.babylonjs.com/communityExtensions/Babylon.js%2BExternalLibraries/BabylonJS_and_ReactJS)

#### テンプレートでの使い方

宣言的ラッパーに強く依存せず、レンダリング処理をReact/Vueから分離する。

```text
React/Vue Component
    ↓ mount / unmount / resize
RenderingAdapter
    ↓
Babylon Engine / Scene
```

この構造にすると、次の責務を分離できる。

- React/Vue: 画面UI、フォーム、ルーティング、サーバー状態
- RenderingAdapter: Canvasのライフサイクル、resize、初期化、破棄
- Babylon.js: シーン、カメラ、ライト、アセット、レンダーループ

### 4.2 Three.js + React Three Fiber

#### 概要

Three.jsは、軽量で汎用的なWeb 3Dライブラリであり、非常に大きなエコシステムを持つ。WebGLとWebGPUレンダラーを提供し、`WebGPURenderer`はWebGPU非対応環境でWebGL 2バックエンドへフォールバックできる。

参考:

- [Three.js公式リポジトリ](https://github.com/mrdoob/three.js)
- [Three.js WebGPURenderer](https://threejs.org/docs/pages/WebGPURenderer.html)

React Three Fiberは、Three.jsオブジェクトをReact JSXとして記述するカスタムレンダラーである。

```tsx
<Canvas>
  <mesh position={[0, 1, 0]}>
    <boxGeometry />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

参考:

- [React Three Fiber Introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [React Three Fiber TypeScript](https://r3f.docs.pmnd.rs/api/typescript)

#### 長所

- Reactコンポーネントとして3Dシーンを宣言的に構築できる
- Reactのstate、イベント、Suspense、コンポーネント分割と自然に統合できる
- Three.js本体の非常に大きなエコシステムを利用できる
- Drei、物理、ポストプロセスなどの周辺ライブラリが豊富である
- Three.jsに追加されたクラスをラッパーの更新待ちなしで利用しやすい
- Reactを理解している開発者にとって学習しやすい

#### 短所

- Three.js本体はJavaScript実装で、TypeScript型定義はコミュニティ管理である
- ReactのメジャーバージョンとReact Three Fiberの対応関係を管理する必要がある
- 物理、ヘルパー、状態管理などで依存パッケージが増えやすい
- 毎フレームの値をReact stateに流すと不要な再レンダリングを起こしやすい
- Vueへ変更する場合、React Three Fiber部分をTresJSなどへ書き換える必要がある

Three.jsの公式ガイドでも、TypeScript型定義はコミュニティ管理と説明されている。

参考:

- [Three.js Installation](https://threejs.org/manual/en/installation.html)

### 4.3 Three.js + TresJS

#### 概要

TresJSはVue 3のカスタムレンダラーとしてThree.jsを宣言的に扱う。

```vue
<TresCanvas>
  <TresPerspectiveCamera :position="[0, 0, 5]" />
  <TresMesh>
    <TresBoxGeometry />
    <TresMeshStandardMaterial color="orange" />
  </TresMesh>
</TresCanvas>
```

TypeScript、HMR、Vue DevTools、Nuxt統合、専用CLI、ESLint設定を提供している。

参考:

- [TresJS公式ドキュメント](https://docs.tresjs.org/)
- [TresJS Installation](https://docs.tresjs.org/getting-started/installation)
- [TresJS公式リポジトリ](https://github.com/Tresjs/tres)

#### 長所

- VueコンポーネントとComposition APIでシーンを構築できる
- Vueのリアクティビティ、SFC、HMR、DevToolsとの相性がよい
- TypeScriptを前提とした開発体験を提供する
- Vue + Vite / Nuxt向けの公式セットアップがある
- Three.jsの機能を広く利用できる

#### 短所

- React Three Fiberよりコミュニティと拡張パッケージの規模が小さい
- Three.js本体の型定義がコミュニティ管理である
- Vue固有のカスタムレンダラーへ依存する
- フレームワークをReactへ変更する場合、3Dコンポーネントの書き換えが必要になる

Vue採用時の判断は次のようになる。

- Vueとの一体感を優先する: TresJS
- エンジン機能とフレームワーク非依存性を優先する: Babylon.js

### 4.4 PlayCanvas Engine

#### 概要

PlayCanvasはECS、物理、アニメーション、glTFストリーミング、WebXR、音声、入力、Gaussian Splattingなどを備えた統合ゲームエンジンである。

WebGL 2とWebGPUのデュアルバックエンドを提供し、WebGPU computeやWGSLにも積極的に対応している。

参考:

- [PlayCanvas Engine](https://playcanvas.com/products/engine)
- [PlayCanvas公式リポジトリ](https://github.com/playcanvas/engine)

#### 長所

- WebGL 2 / WebGPUデュアルバックエンド
- モバイルを意識した軽量ランタイム
- ECSによる大規模シーン管理
- 公式Reactレンダラー
- フレームワーク非依存のWeb Components
- ブラウザ上で利用できるビジュアルEditor
- 物理、XR、入力、音声、アセット管理が統合されている
- MITライセンス

参考:

- [PlayCanvas React](https://developer.playcanvas.com/user-manual/react/)
- [PlayCanvas Web Components](https://developer.playcanvas.com/user-manual/web-components/)

#### 短所

- エンジン本体はJavaScript実装である
- 完全なTypeScript宣言はあるが、ネイティブなTypeScript実装ではない
- React統合は強いが、Vue専用の同等レイヤーはない
- Editor中心のワークフローとコード中心のワークフローで設計判断が分かれる

「アプリケーション側が型安全」であれば十分だが、「主要依存ライブラリまでTypeScript」というコンセプトではBabylon.jsが上回る。

### 4.5 Three.js単体

Three.js単体は自由度が高く、ライブラリとして軽量である。一方、Canvasのライフサイクル、レンダーループ、アセット管理、イベント、物理、状態同期などをテンプレート側で設計する必要がある。

次の場合に適している。

- React/Vueに依存しない薄い3Dレイヤーを自作したい
- 必要な機能だけを組み合わせたい
- 統合エンジンによる制約を避けたい
- Three.jsの巨大なエコシステムを直接利用したい

汎用テンプレートでは設計の自由度が利用者ごとの差異を増やすため、標準構成としてはBabylon.jsより運用負荷が高い。

## 5. 用途特化・低レベル候補

| 候補 | 適した用途 | テンプレート標準としての評価 |
|---|---|---:|
| **Babylon Lite** | WebGPU専用、極小バンドル、高性能 | ★★★☆☆ |
| **luma.gl / deck.gl** | 大規模データ可視化、GPU計算、地理データ | ★★★☆☆ |
| **CesiumJS** | 3D地球、GIS、3D Tiles、地形 | ★★☆☆☆ |
| **PixiJS** | 高性能2D、Sprite、UI、2Dゲーム | ★★☆☆☆ |
| **regl** | 独自GLSL、低レベルWebGL、研究用途 | ★★☆☆☆ |
| **OGL** | 軽量なカスタム3D表現、フルスクリーンShader | ★★☆☆☆ |
| **A-Frame** | WebXR/VRをHTML中心に構築 | ★★☆☆☆ |
| **VTK.js** | 医療・科学・ボリューム可視化 | ★★☆☆☆ |
| **`<model-viewer>`** | glTFモデル表示とAR | ★★☆☆☆ |

### 5.1 Babylon Lite

Babylon Liteは、WebGPU専用、データ指向、tree-shake可能な新しいエンジンである。通常のBabylon.jsを置き換えるものではなく、用途によって並行利用する位置づけである。

参考:

- [Babylon Lite公式サイト](https://www.babylonjs.com/lite/)

性能とバンドルサイズは魅力的だが、現時点の標準テンプレートには採用しない。

- WebGLフォールバックがない
- 登場直後でAPIと周辺統合が成熟途上である
- Babylon.jsとの互換レイヤーも実験段階である
- 利用者のブラウザ要件をWebGPU対応環境に限定する

将来、WebGPU専用プロファイルとして追加するのが適切である。

### 5.2 luma.gl / deck.gl

luma.glは、WebGL 2 / WebGPU向けのTypeScript GPUツールキットであり、大規模データ処理や可視化に強い。

deck.glはその上で大量の点、線、ポリゴン、地理データをレイヤーとして描画する。公式TypeScript型とReact統合も提供する。

参考:

- [luma.gl Overview](https://luma.gl/docs)
- [deck.gl Introduction](https://deck.gl/docs)
- [Using deck.gl with TypeScript](https://deck.gl/docs/get-started/using-with-typescript)

一般的な3Dゲームやプロダクトビューアには機能の方向性が合わない。大量データ可視化が主目的なら、Babylon.jsより適している。

### 5.3 CesiumJS

CesiumJSは、高精度WGS84地球、3D Tiles、地形、衛星・航空データ、時系列地理データのためのライブラリである。

参考:

- [CesiumJS公式サイト](https://cesium.com/platform/cesiumjs/)
- [CesiumJS公式リポジトリ](https://github.com/CesiumGS/cesium)

GIS用途では非常に強いが、一般的な3Dアプリの標準エンジンとして採用すると、地理座標系や大規模データ向け設計が過剰になる。

### 5.4 PixiJS

PixiJSは、TypeScript実装の高性能2Dレンダラーであり、WebGLとWebGPUに対応する。

参考:

- [PixiJS公式ドキュメント](https://pixijs.com/8.x/guides/getting-started/intro)
- [PixiJS公式リポジトリ](https://github.com/pixijs/pixijs)

2Dゲーム、Sprite、Canvas UIなら有力だが、一般的な3D用途ではBabylon.jsやThree.jsの代替にならない。

### 5.5 regl / OGL

reglはWebGLの共有状態を関数型APIで整理する薄いラッパーである。シーン、カメラ、PBR、アセットローダーなどは自分で構築する必要がある。

OGLも小さなWebGLライブラリで、独自Shaderを使ったWeb表現に向いている。一方でJavaScript実装であり、WebGPUバックエンドを持たない。

参考:

- [regl公式リポジトリ](https://github.com/regl-project/regl)
- [OGL公式リポジトリ](https://github.com/oframe/ogl)

WebGLやGPUプログラミングを学習するテンプレートには適しているが、DB・BEを含む汎用アプリテンプレートの標準としては低レベルすぎる。

### 5.6 A-Frame

A-FrameはThree.jsの上に構築された、HTMLとEntity Component構造を中心とするWebXRフレームワークである。

参考:

- [A-Frame Introduction](https://aframe.io/docs/)

VR/XRを短期間で構築する用途では有力だが、HTML属性中心の設計はTypeScriptによる厳密な型安全性を中心に据える今回のテンプレートとは合いにくい。

### 5.7 VTK.js

VTK.jsは、医療画像、科学技術データ、ボリュームレンダリングなどの科学可視化に特化している。

参考:

- [VTK.js Overview](https://kitware.github.io/vtk-js/docs/)

一般的な3Dアプリケーションには過剰だが、医療・研究用途では汎用3Dエンジンより適している。

### 5.8 `<model-viewer>`

`<model-viewer>`は、glTF/GLBモデル表示、カメラ操作、AR表示をWeb Componentで簡単に提供する。

参考:

- [`<model-viewer>`公式サイト](https://modelviewer.dev/)

モデルを表示するだけなら最小構成で済むが、独自シーン、ゲームロジック、複雑なエフェクトを必要とするアプリには向かない。

## 6. 推奨構成

### 6.1 フレームワーク非依存の汎用テンプレート

```text
PostgreSQL
    ↓
Hono + TypeScript
    ↓ typed HTTP contract
React or Vue + TypeScript
    ↓
RenderingAdapter
    ↓
Babylon.js
```

初期状態では次のパッケージに限定する。

```text
@babylonjs/core
@babylonjs/loaders
```

必要に応じて追加する。

```text
@babylonjs/gui
@babylonjs/inspector
@babylonjs/havok
```

### 6.2 React専用テンプレート

Reactコンポーネントとしての3D開発体験を優先する場合は、次を採用する。

```text
React 19
@react-three/fiber
three
@types/three
```

周辺ライブラリを無制限に追加せず、テンプレート側で推奨構成と互換バージョンを固定する必要がある。

### 6.3 Vue専用テンプレート

Vueのリアクティビティ、SFC、DevToolsを優先する場合は、次を採用する。

```text
Vue 3
@tresjs/core
three
@types/three
```

## 7. TypeScriptコンセプト上の注意点

「すべてTypeScript」としても、次の要素はTypeScriptだけでは静的検査できない。

- GLSL / WGSLを文字列で記述したShader
- glTF、テクスチャなどの外部アセット
- GPUごとの機能上限やドライバ差異
- SQLを直接記述する場合のクエリ
- APIから受け取る未検証のJSON

そのため、アプリケーション構造を次のように分離する。

```text
packages/
  contracts/       API DTOと実行時バリデーション
  renderer/        Babylon.js依存の描画ロジック
  frontend/        ReactまたはVue
  backend/         Hono
```

また、毎フレーム変化する3D状態をReact/Vueの通常stateへそのまま流してはならない。状態は次の2種類に分ける。

- UI・サーバー状態: React/Vueの状態管理を利用
- 毎フレームの描画状態: Babylon.jsのレンダーループ内で管理

TypeScriptとLintに加えて、次の検査も必要になる。

- API境界の実行時スキーマ検証
- glTFなどのアセット検証
- Shaderのコンパイル・Lint
- 実ブラウザでのWebGL/WebGPU初期化テスト
- Canvas破棄、GPUリソース解放、context lostのテスト

## 8. Docker Composeとの関係

WebGL/WebGPU処理は利用者のブラウザで実行されるため、レンダリングライブラリの選択はDocker Composeの基本構成に大きく影響しない。

```text
docker compose up --build
  ├─ db: PostgreSQL
  ├─ backend: Hono
  └─ frontend: React/Vue + Vite
```

Compose構成では、次の点を考慮する。

- FE開発サーバーを`0.0.0.0`でlistenさせる
- PostgreSQLとHonoにhealth checkを設定する
- HonoはDBのhealth check完了後に起動する
- glTF、テクスチャ、WASMを正しいMIME typeで配信する
- Draco、KTX2、HavokなどのWASM/decoderファイルを本番用にセルフホストする
- FEからBEへの接続先を環境変数で切り替える
- WebGL/WebGPUのE2Eテストはコンテナ内のGPU条件に依存させすぎない

## 9. 最終提案

標準テンプレートでは、**Babylon.js + RenderingAdapter**を採用する。

```text
標準:
  PostgreSQL + Hono + React/Vue + Babylon.js

将来の派生テンプレート:
  React + React Three Fiber
  Vue + TresJS
  WebGPU専用 + Babylon Lite
```

この方針には次の利点がある。

- React/Vueの選択をレンダリングエンジンから分離できる
- アプリケーションコードをTypeScriptで統一できる
- WebGLを標準として広いブラウザ互換性を確保できる
- WebGPUへ段階的に移行できる
- テンプレート利用者が物理、XR、GUIなどを公式モジュールで拡張できる
- 依存パッケージの組み合わせを抑え、保守方針を明確にできる

したがって、当初予定していたBabylon.jsの採用は適切である。ただし、React専用テンプレートとして最高の宣言的DXを提供したい場合に限り、Three.js + React Three Fiberを別テンプレートとして用意するのが望ましい。
