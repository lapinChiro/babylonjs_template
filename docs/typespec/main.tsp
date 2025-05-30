import "@typespec/http";

using Http;
@service(#{ title: "Template Service" })
namespace TemplateService;

model Widget {
  id: string;
  weight: int32;
  color: "red" | "blue";
}

model WidgetList {
  items: Widget[];
}

@error
model Error {
  code: int32;
  message: string;
}

model AnalyzeResult {
  id: string;
  analysis: string;
}

@route("/widgets")
@tag("Widgets")
interface Widgets {
  /** List widgets */
  @get list(): WidgetList | Error;
  /** Read widgets */
  @get read(@path id: string): Widget | Error;
  /** Create a widget */
  @post create(@body body: Widget): Widget | Error;
  /** Update a widget */
  @patch update(@path id: string, @body body: MergePatchUpdate<Widget>): Widget | Error;
  /** Delete a widget */
  @delete delete(@path id: string): void | Error;

  /** Analyze a widget */
  @route("{id}/analyze") @post analyze(@path id: string): AnalyzeResult | Error;
}

model PlainResult {
  result_code: string;
}

model OAuthLoginData {
  url: string;
}

model OAuthLogin {
  data: OAuthLoginData;
  result_code: string;
}

model OAuthResult {
  code: string;
  state: string;
}

model LoginSessionResponseData {
  name: string;
  mail: string;
}

model LoginSessionResponse {
  result_code: string;
  data: LoginSessionResponseData;
}

@route("/logins")
@tag("Login")
interface Login {
  /** Login */
  @get login(): OAuthLogin | Error;
  /** OAuth */
  @post oauth(@body body: OAuthResult): PlainResult | Error;
  /** Logout */
  @delete logout(): PlainResult | Error;

  /** セッション確認 */
  @route("session") @get session(): LoginSessionResponse | Error;
}

model MemoData {
  title: string;
  content: string;
}

model MemoItem {
  uuid: string;
  title: string;
  content: string;
  created_utsms: int64;
  updated_utsms: int64;
}

model MemoListResponse {
  result_code: string;
  list: MemoItem[];
}

model MemoDetailResponse {
  result_code: string;
  data: MemoData;
}

@route("/memos")
@tag("Memo")
interface Memo {
  /** 詳細 */
  @get read(@path uuid: string): MemoDetailResponse | Error;
  /** 一覧 */
  @get list(): MemoListResponse | Error;
  /** 作成 */
  @post create(@body body: MemoData): PlainResult | Error;
  /** 更新 */
  @post update(@path id: string, @body body: MemoData): PlainResult | Error;
  /** 削除 */
  @delete remove(@path uuid: string): PlainResult | Error;
}