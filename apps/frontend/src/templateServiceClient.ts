import { createLoginClientContext, type LoginClientContext, type LoginClientOptions } from "./api/loginClient/loginClientContext.js";
import { login, type LoginOptions, logout, type LogoutOptions, oauth, type OauthOptions, session, type SessionOptions } from "./api/loginClient/loginClientOperations.js";
import { createMemoClientContext, type MemoClientContext, type MemoClientOptions } from "./api/memoClient/memoClientContext.js";
import { create as create_2, type CreateOptions as CreateOptions_2, list as list_2, type ListOptions as ListOptions_2, read as read_2, type ReadOptions as ReadOptions_2, remove, type RemoveOptions, update as update_2, type UpdateOptions as UpdateOptions_2 } from "./api/memoClient/memoClientOperations.js";
import { createTemplateServiceClientContext, type TemplateServiceClientContext, type TemplateServiceClientOptions } from "./api/templateServiceClientContext.js";
import { createWidgetsClientContext, type WidgetsClientContext, type WidgetsClientOptions } from "./api/widgetsClient/widgetsClientContext.js";
import { analyze, type AnalyzeOptions, create, type CreateOptions, delete_, type DeleteOptions, list, type ListOptions, read, type ReadOptions, update, type UpdateOptions } from "./api/widgetsClient/widgetsClientOperations.js";
import type { MemoData, MergePatchUpdate, OAuthResult, Widget } from "./models/models.js";

export class TemplateServiceClient {
  #context: TemplateServiceClientContext
  widgetsClient: WidgetsClient;
  loginClient: LoginClient;
  memoClient: MemoClient
  constructor(endpoint: string, options?: TemplateServiceClientOptions) {
    this.#context = createTemplateServiceClientContext(endpoint, options);
    this.widgetsClient = new WidgetsClient(
      endpoint,
      options
    );;this.loginClient = new LoginClient(
      endpoint,
      options
    );;this.memoClient = new MemoClient(endpoint, options);
  }

}
export class MemoClient {
  #context: MemoClientContext

  constructor(endpoint: string, options?: MemoClientOptions) {
    this.#context = createMemoClientContext(endpoint, options);

  }
  async read(uuid: string, options?: ReadOptions_2) {
    return read_2(this.#context, uuid, options);
  };
  async list(options?: ListOptions_2) {
    return list_2(this.#context, options);
  };
  async create(body: MemoData, options?: CreateOptions_2) {
    return create_2(this.#context, body, options);
  };
  async update(id: string, body: MemoData, options?: UpdateOptions_2) {
    return update_2(this.#context, id, body, options);
  };
  async remove(uuid: string, options?: RemoveOptions) {
    return remove(this.#context, uuid, options);
  }
}
export class LoginClient {
  #context: LoginClientContext

  constructor(endpoint: string, options?: LoginClientOptions) {
    this.#context = createLoginClientContext(endpoint, options);

  }
  async login(options?: LoginOptions) {
    return login(this.#context, options);
  };
  async oauth(body: OAuthResult, options?: OauthOptions) {
    return oauth(this.#context, body, options);
  };
  async logout(options?: LogoutOptions) {
    return logout(this.#context, options);
  };
  async session(options?: SessionOptions) {
    return session(this.#context, options);
  }
}
export class WidgetsClient {
  #context: WidgetsClientContext

  constructor(endpoint: string, options?: WidgetsClientOptions) {
    this.#context = createWidgetsClientContext(endpoint, options);

  }
  async list(options?: ListOptions) {
    return list(this.#context, options);
  };
  async read(id: string, options?: ReadOptions) {
    return read(this.#context, id, options);
  };
  async create(body: Widget, options?: CreateOptions) {
    return create(this.#context, body, options);
  };
  async update(id: string, body: MergePatchUpdate, options?: UpdateOptions) {
    return update(this.#context, id, body, options);
  };
  async delete_(id: string, options?: DeleteOptions) {
    return delete_(this.#context, id, options);
  };
  async analyze(id: string, options?: AnalyzeOptions) {
    return analyze(this.#context, id, options);
  }
}