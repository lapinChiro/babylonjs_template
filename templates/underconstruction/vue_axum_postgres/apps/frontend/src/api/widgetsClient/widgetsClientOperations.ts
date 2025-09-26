import { parse } from "uri-template";
import type { WidgetsClientContext } from "./widgetsClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";
import { jsonAnalyzeResultToApplicationTransform, jsonMergePatchUpdateToTransportTransform, jsonWidgetListToApplicationTransform, jsonWidgetToApplicationTransform, jsonWidgetToTransportTransform } from "../../models/internal/serializers.js";
import { AnalyzeResult, type MergePatchUpdate, Widget, WidgetList } from "../../models/models.js";

export interface ListOptions extends OperationOptions {

}
export async function list(
  client: WidgetsClientContext,
  options?: ListOptions,
): Promise<WidgetList> {
  const path = parse("/widgets").expand({

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
    return jsonWidgetListToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface ReadOptions extends OperationOptions {

}
export async function read(
  client: WidgetsClientContext,
  id: string,
  options?: ReadOptions,
): Promise<Widget> {
  const path = parse("/widgets/{id}").expand({
    id: id
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
    return jsonWidgetToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface CreateOptions extends OperationOptions {

}
export async function create(
  client: WidgetsClientContext,
  body: Widget,
  options?: CreateOptions,
): Promise<Widget> {
  const path = parse("/widgets").expand({

  });
  const httpRequestOptions = {
    headers: {

    },body: jsonWidgetToTransportTransform(body),
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonWidgetToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface UpdateOptions extends OperationOptions {

}
export async function update(
  client: WidgetsClientContext,
  id: string,
  body: MergePatchUpdate,
  options?: UpdateOptions,
): Promise<Widget> {
  const path = parse("/widgets/{id}").expand({
    id: id
  });
  const httpRequestOptions = {
    headers: {

    },body: jsonMergePatchUpdateToTransportTransform(body),
  };
  const response = await client.pathUnchecked(path).patch(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonWidgetToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface DeleteOptions extends OperationOptions {

}
export async function delete_(
  client: WidgetsClientContext,
  id: string,
  options?: DeleteOptions,
): Promise<void> {
  const path = parse("/widgets/{id}").expand({
    id: id
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
  if (+response.status === 204 && !response.body) {
    return;
  }
  throw createRestError(response);
}
;
export interface AnalyzeOptions extends OperationOptions {

}
export async function analyze(
  client: WidgetsClientContext,
  id: string,
  options?: AnalyzeOptions,
): Promise<AnalyzeResult> {
  const path = parse("/widgets/{id}/analyze").expand({
    id: id
  });
  const httpRequestOptions = {
    headers: {

    },
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);

  ;
  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonAnalyzeResultToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;