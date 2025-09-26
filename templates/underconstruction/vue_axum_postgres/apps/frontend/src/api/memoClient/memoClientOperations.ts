import { parse } from "uri-template";
import type { MemoClientContext } from "./memoClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";
import { jsonMemoDataToTransportTransform, jsonMemoDetailResponseToApplicationTransform, jsonMemoListResponseToApplicationTransform, jsonPlainResultToApplicationTransform } from "../../models/internal/serializers.js";
import { type MemoData, MemoDetailResponse, MemoListResponse, PlainResult } from "../../models/models.js";

export interface ReadOptions extends OperationOptions {

}
export async function read(
  client: MemoClientContext,
  uuid: string,
  options?: ReadOptions,
): Promise<MemoDetailResponse> {
  const path = parse("/memos/{uuid}").expand({
    uuid: uuid
  });
  const httpRequestOptions = {
    headers: {

    },
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonMemoDetailResponseToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface ListOptions extends OperationOptions {

}
export async function list(
  client: MemoClientContext,
  options?: ListOptions,
): Promise<MemoListResponse> {
  const path = parse("/memos").expand({

  });
  const httpRequestOptions = {
    headers: {

    },
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonMemoListResponseToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface CreateOptions extends OperationOptions {

}
export async function create(
  client: MemoClientContext,
  body: MemoData,
  options?: CreateOptions,
): Promise<PlainResult> {
  const path = parse("/memos").expand({

  });
  const httpRequestOptions = {
    headers: {

    },body: jsonMemoDataToTransportTransform(body),
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonPlainResultToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface UpdateOptions extends OperationOptions {

}
export async function update(
  client: MemoClientContext,
  id: string,
  body: MemoData,
  options?: UpdateOptions,
): Promise<PlainResult> {
  const path = parse("/memos/{id}").expand({
    id: id
  });
  const httpRequestOptions = {
    headers: {

    },body: jsonMemoDataToTransportTransform(body),
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonPlainResultToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface RemoveOptions extends OperationOptions {

}
export async function remove(
  client: MemoClientContext,
  uuid: string,
  options?: RemoveOptions,
): Promise<PlainResult> {
  const path = parse("/memos/{uuid}").expand({
    uuid: uuid
  });
  const httpRequestOptions = {
    headers: {

    },
  };
  const response = await client.pathUnchecked(path).delete(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonPlainResultToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;