import { type Client, type ClientOptions, getClient } from "@typespec/ts-http-runtime";

export interface MemoClientContext extends Client {

}export interface MemoClientOptions extends ClientOptions {
  endpoint?: string;
}export function createMemoClientContext(
  endpoint: string,
  options?: MemoClientOptions,
): MemoClientContext {
  const params: Record<string, any> = {
    endpoint: endpoint
  };
  const resolvedEndpoint = "{endpoint}".replace(/{([^}]+)}/g, (_, key) =>
    key in params ? String(params[key]) : (() => { throw new Error(`Missing parameter: ${key}`); })()
  );;return getClient(resolvedEndpoint,{
    ...options,
  })
}