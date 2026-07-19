---
paths:
  - "apps/backend/src/services/**"
  - "apps/backend/src/utils/**"
  - "apps/backend/src/testing/**"
  - "apps/backend/src/dev/**"
  - "apps/backend/Dockerfile"
  - "apps/backend/tsconfig.build.json"
  - "**/src/services/**"
  - "**/src/testing/**"
---
# 外部 API transport と MSW モックの規約

## 適用条件

backend (`apps/backend`) で**外部 HTTP API**（Slack / Google / GitHub 等、自サービス外への HTTP 呼び出し）を新規に追加・変更するとき。また、その外部 API をテスト・ローカル動作確認でスタブするとき。

`githubBatchInvoker` のような **Lambda invoke (AWS SDK、非 HTTP)** は本規約の対象外（HTTP ではないため MSW で捕捉できない。DI fake を使う）。

## 背景

かつて backend は「ローカル=fetch 直 / Lambda=proxy 経由」の `isLambda()` 分岐を各サービスに個別実装しており（6 箇所重複）、共通の transport 抽象が無かった。その結果:

- Slack だけ local 分岐を持たず proxy 一択になり、**ローカルで Slack メッセージを観測できない**（mock 不能）状態だった。
- 外部 API のスタブが「テスト用 DI fake」と「ローカル用（無し）」で二重管理・不統一だった。

これを transport seam (`utils/external-http.ts`) への集約と、MSW handler のローカル/テスト共有で解消した（PRD-95）。本規約は再発を防ぐ。

## 制約

### 1. 外部 HTTP は transport seam を経由する

新規の外部 HTTP 呼び出しは、各サービスで `isLambda()` 分岐や `fetch` 直書きをせず、**`utils/external-http.ts` の seam を使う**:

- `externalHttpRequest<T>(input, traceId?)`: 成功=HTTP 2xx、非 2xx で throw、JSON parse して返す（標準的な JSON API 用）。
- `externalHttpRequestRaw(input, traceId?)`: `{ statusCode, body }` を生返却（status を呼び出し側で判定する API 用。例: GitHub の 201）。

`isLambda()` 分岐（proxy / fetch）は seam の内部にのみ存在させる。

### 2. API 固有のエラー解釈は service に残す（seam に畳まない）

seam は**純粋 transport**に限定する。以下のような API 固有の成否解釈は **seam ではなく呼び出し側 service** に置く:

- Slack `chat.postMessage` の `ok` フィールド（HTTP 200 でも `ok:false` は失敗）
- GitHub GraphQL の `errors[]`（HTTP 200 でも errors があれば失敗）
- GitHub installation token の `201` 判定
- Drive copy の `id` 存在判定

### 3. テスト・ローカル mock は MSW handler を共有する

外部 API のスタブは **MSW** で行い、handler は `src/testing/external-api-mock/` に集約して**テストとローカル mock で共有**する:

- テスト: `vitest.msw-setup.ts` が unit / integration 両プロジェクトで `server.listen({ onUnhandledRequest: 'error' })` / `afterEach resetHandlers` / `afterAll close`。ケース毎の応答は `server.use(...)` で override。
- ローカル mock: `src/dev/main.ts` が `EXTERNAL_API_MODE=mock` 時に同じ server を起動し、捕捉 payload を logger 出力。
- handler は**純粋**（request → canned response）に保ち、**logging は handler に持たせず** dev server 側のライフサイクル（`server.events`）で行う。

新しい外部エンドポイントを追加したら、対応する MSW handler を `handlers.ts` に追加する（`onUnhandledRequest: 'error'` のため未定義だとテストが落ちる）。

### 4. dev/test 専用コードは production build から除外する

MSW server/handler (`src/testing/`) と dev エントリ (`src/dev/`) は `tsconfig.build.json` の `exclude` 対象とし、`Dockerfile` は `tsc -p tsconfig.build.json` でビルドする。production (`lambda.ts`) からは MSW を一切参照しない。`msw` は devDependency。

## 禁止事項

- 外部 HTTP 呼び出しで service / util に `isLambda()` 分岐や `fetch` 直書きを新設すること（seam を使う）。
- seam (`externalHttpRequest*`) に Slack `ok` / GraphQL `errors[]` / 201 判定等の **API 固有エラー解釈を畳む**こと。
- 外部 API のテストスタブを DI fake と MSW で二重管理すること（HTTP は MSW に寄せる。非 HTTP の Lambda invoke のみ DI fake）。
- MSW server / handler / dev エントリを production build (`tsconfig.build.json` 経由) に含めること。`Dockerfile` を `npx tsc`（= `tsconfig.json`）でビルドすること（test / MSW が Lambda イメージに混入する）。
- `src/testing/` の handler に logging 等の副作用を持たせること（純粋に保ち、logging は dev server 側）。

## 検証

```bash
# [1] 外部 HTTP service が seam 経由（個別 isLambda 分岐の不在）。
#     対象サービスに isLambda の直呼びが無いこと（残るのは env/secrets/external-http のみ）。
cd apps/backend
grep -rnE "isLambda" src/services src/utils/github-app-auth.ts \
  | grep -vE "external-http\.ts|env\.ts|secrets\.ts"
# → 期待: 0 件（seam 集約後、サービス側に isLambda 直呼びは無い）

# [2] production build に test / MSW / dev が混入しない。
rm -rf dist && npm run build >/dev/null 2>&1
find dist -name '*.test.js' -o -path '*__tests__*' -o -path '*src/testing*' -o -path '*src/dev*' | wc -l
grep -rl "from 'msw" dist | wc -l
# → 期待: いずれも 0

# [3] Dockerfile が tsconfig.build.json でビルドする。
grep -n "tsc -p tsconfig.build.json" Dockerfile   # → 期待: 1 件
```


## 関連ドキュメント

- 制定経緯の PRD (PRD-95) は完了時に削除済。歴史は git log / plan.md を参照。
- 関連ルール: [rule-retroactive-application.md](rule-retroactive-application.md) / [testing.md](testing.md) / [local-quality-mirrors-ci.md](local-quality-mirrors-ci.md)
