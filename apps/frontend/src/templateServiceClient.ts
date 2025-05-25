import { createLoginClientContext, type LoginClientContext, type LoginClientOptions } from "./api/loginClient/loginClientContext.js";
import { login, type LoginOptions, logout, type LogoutOptions, oauth, type OauthOptions, session, type SessionOptions } from "./api/loginClient/loginClientOperations.js";
import { createTemplateServiceClientContext, type TemplateServiceClientContext, type TemplateServiceClientOptions } from "./api/templateServiceClientContext.js";
import { createWidgetsClientContext, type WidgetsClientContext, type WidgetsClientOptions } from "./api/widgetsClient/widgetsClientContext.js";
import { analyze, type AnalyzeOptions, create, type CreateOptions, delete_, type DeleteOptions, list, type ListOptions, read, type ReadOptions, update, type UpdateOptions } from "./api/widgetsClient/widgetsClientOperations.js";
import type { MergePatchUpdate, OAuthResult, Widget } from "./models/models.js";

export class TemplateServiceClient {
  #context: TemplateServiceClientContext
  widgetsClient: WidgetsClient;
  loginClient: LoginClient
  constructor(endpoint: string, options?: TemplateServiceClientOptions) {
    this.#context = createTemplateServiceClientContext(endpoint, options);
    this.widgetsClient = new WidgetsClient(
      endpoint,
      options
    );;this.loginClient = new LoginClient(endpoint, options);
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