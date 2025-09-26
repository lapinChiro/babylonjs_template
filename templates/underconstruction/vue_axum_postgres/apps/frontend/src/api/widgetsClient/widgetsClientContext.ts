import { type Client, type ClientOptions, getClient } from "@typespec/ts-http-runtime";

export interface WidgetsClientContext extends Client {

}export interface WidgetsClientOptions extends ClientOptions {
  endpoint?: string;
}export function createWidgetsClientContext(
  endpoint: string,
  options?: WidgetsClientOptions,
): WidgetsClientContext {
  const params: Record<string, any> = {
    endpoint: endpoint
  };
  const resolvedEndpoint = "{endpoint}".replace(/{([^}]+)}/g, (_, key) =>
    key in params ? String(params[key]) : (() => { throw new Error(`Missing parameter: ${key}`); })()
  );;return getClient(resolvedEndpoint,{
    ...options,
  })
}