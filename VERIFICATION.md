# 動作確認計画・結果

## 1. 目的

Docker Composeで構築した実環境に対し、Vue、Babylon.js、Hono、PostgreSQL、
MinIOが個別に起動するだけでなく、利用者の操作フローとして連携することを確認する。

## 2. 検証環境

- Docker Compose: `vue_babylon_hono_postgres/compose.yml`
- Browser: ローカルに導入済みのGoogle Chromeをheadless起動
- 標準renderer: WebGL
- API: `http://localhost:13000`（標準値3000、ローカル競合回避）
- Frontend: `http://localhost:15173`（標準値5173、ローカル競合回避）
- PostgreSQL: `localhost:15432`（標準値5432、ローカル競合回避）
- MinIO: `http://localhost:19000` / Console `19001`（標準値9000 / 9001）
- Runtime: Node.js `24.18.0`、npm `12.0.1`、PostgreSQL `18.4`

## 3. テストデータ方針

- デモユーザー `test1@example.com` を利用する。
- item名には実行ごとに一意な接頭辞 `e2e-` を付ける。
- 画像はブラウザで取得したPNG screenshotを利用する。
- 作成したitem、画像metadata、MinIO objectは検証終了時に削除する。
- PostgreSQL volumeは削除せず、利用者が続けて確認できるようコンテナを起動状態で残す。

## 4. テストケースと合格条件

| ID | 分類 | 確認内容 | 合格条件 |
|---|---|---|---|
| ENV-01 | Build | 全Docker imageをbuild | 全build成功 |
| ENV-02 | Health | PostgreSQL、MinIO、Backendのhealth | healthy |
| ENV-03 | Ports | 15173、13000、15432、19000、19001 | HTTP/TCP接続可能 |
| API-01 | Public API | `/health`、`/doc`、`/swagger-ui` | HTTP 200、OpenAPI形式 |
| AUTH-01 | Auth | 誤ったpassword | HTTP 401 |
| AUTH-02 | Auth | デモユーザーでlogin | HTTP 200、JWTとuser |
| AUTH-03 | Auth | tokenなしのitems/images | HTTP 401 |
| CRUD-01 | PostgreSQL | item create/list/update/delete | responseとDB状態が一致 |
| CRUD-02 | Persistence | item作成後にPostgreSQL・Backend再起動 | 再取得可能 |
| OBJ-01 | MinIO | presigned upload URL取得 | URLとobject keyを取得 |
| OBJ-02 | MinIO | PNG upload・confirm・list・download | 内容とmetadataが一致 |
| OBJ-03 | MinIO | image削除 | metadataとobjectを削除 |
| UI-01 | Router | 未認証でdashboardへ遷移 | loginへredirect |
| UI-02 | Login | 実フォームからlogin | dashboard表示 |
| UI-03 | Item UI | 追加・一覧反映・削除 | DOMとAPI状態が一致 |
| UI-04 | Image UI | file選択・upload・削除 | thumbnail表示後に消える |
| UI-05 | Logout | logout後にdashboardへ直アクセス | loginへredirect |
| 3D-01 | Initialize | Babylon Canvas初期化 | overlay消滅、backend表示 |
| 3D-02 | Render | Canvas screenshot | 3D描画を視認可能 |
| 3D-03 | Resize | desktopからmobile viewportへ変更 | backing sizeとCSS sizeが追従 |
| 3D-04 | Runtime | console・page exception | errorなし |
| GPU-01 | WebGPU | `webgpu`指定で再起動 | WebGPU、または明示的WebGL fallback |
| OPS-01 | Logs | 全container log | 未処理例外・crash loopなし |
| OPS-02 | Cleanup | 作成したtest data | 残存なし |

## 5. 実施結果（2026-07-17）

| ID | 結果 | 確認結果 |
|---|---|---|
| ENV-01 | PASS | frontend/backendともNode 24.18.0 image内の`npm ci`を含めbuild成功 |
| ENV-02 | PASS | PostgreSQL 18.4、MinIO、Backendがhealthy、FrontendがUp |
| ENV-03 | PASS | 15173、13000、15432、19000、19001へ接続成功 |
| API-01 | PASS | health、OpenAPI、Swagger UIが200。OpenAPI pathsの空出力を検出・修正後に再確認 |
| AUTH-01 | PASS | 誤passwordが401 |
| AUTH-02 | PASS | デモユーザーで200、JWT三部形式とuserを確認 |
| AUTH-03 | PASS | tokenなしのitems/imagesが401 |
| CRUD-01 | PASS | create/list/update/deleteと404を実APIで確認 |
| CRUD-02 | PASS | Backend停止・PostgreSQL 18再起動後にitemを再取得し、確認後削除 |
| OBJ-01 | PASS | 許可MIMEから`.png` object keyを生成。path風filenameがkeyへ混入しないことを確認 |
| OBJ-02 | PASS | presigned PUT、confirm、list、downloadのbyte一致を確認 |
| OBJ-03 | PASS | API delete後、既存presigned URLが404 |
| UI-01 | PASS | headless Chromeでdashboardからloginへのredirectを確認 |
| UI-02 | PASS | DOMへ値を設定するだけでなく、実form submitからdashboard遷移を確認 |
| UI-03 | PASS | UIで`e2e-ui-item`を追加しDOM反映後に削除 |
| UI-04 | PASS | Browser `File`でPNGをupload、thumbnailのnaturalWidthを確認後に削除 |
| UI-05 | PASS | logout後のdashboard直アクセスがloginへredirect |
| 3D-01 | PASS | overlay消滅、caption `WEBGL`、WebGL 2.0 contextを確認 |
| 3D-02 | PASS | 1440px screenshotを目視し、PBRメッシュ、リング、床面の描画を確認 |
| 3D-03 | PASS | 最終実行で691x416からmobile viewportの364x320へCSS/backing sizeが追従 |
| 3D-04 | PASS | 最終ブラウザ実行でconsole error、page exception、network failure、HTTP 4xx/5xxが各0件 |
| GPU-01 | PASS | WebGPU指定では`WEBGL（WebGPUからフォールバック）`を表示し、errorなし |
| OPS-01 | PASS | crash loop・未処理例外なし。ログ上のSIGTERMは永続性試験で意図的にBackendを停止した記録 |
| OPS-02 | PASS | `e2e-%` itemと`smoke.png` / `browser-smoke.png` metadataが各0件、試験objectも削除済み |

## 6. 実施中に検出・修正した事項

- PostgreSQL 18で変更されたvolume layoutへ合わせ、`/var/lib/postgresql`をmountする構成へ変更。
- ホスト側ポートを環境変数化し、MinIOの内部portとpresigned URL用外部portを分離。
- HonoのOpenAPI route registryと`/doc`の登録先を統一。
- Kysely 0.29のmigration専用export、Vite 8の関数形式`manualChunks`とOxc minifierへ移行。
- 最新`json-server`で廃止済みのmiddleware/routesを使う未使用mock構成を削除。
- npm 12のinstall-script policyで、必要な`bcrypt@6.0.0`と`esbuild@0.28.1`だけをversion pin付き承認。

## 7. 最終状態

- Docker Compose環境は、利用者が続けて確認できるよう起動したままにする。
- rendererは標準のWebGLへ戻している。
- PostgreSQL/MinIO volumeは保持し、E2Eで作成したデータだけを削除している。
