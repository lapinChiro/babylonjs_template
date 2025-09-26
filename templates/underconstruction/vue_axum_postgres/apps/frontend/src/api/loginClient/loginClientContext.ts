import { type Client, type ClientOptions, getClient } from "@typespec/ts-http-runtime";

export interface LoginClientContext extends Client {

}export interface LoginClientOptions extends ClientOptions {
  endpoint?: string;
}export function createLoginClientContext(
  endpoint: string,
  options?: LoginClientOptions,
): LoginClientContext {
  const params: Record<string, any> = {
    endpoint: endpoint
  };
  const resolvedEndpoint = "{endpoint}".replace(/{([^}]+)}/g, (_, key) =>
    key in params ? String(params[key]) : (() => { throw new Error(`Missing parameter: ${key}`); })()
  );;return getClient(resolvedEndpoint,{
    ...options,
  })
}