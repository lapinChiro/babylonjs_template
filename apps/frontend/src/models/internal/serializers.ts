import { AnalyzeResult, LoginSessionResponse, LoginSessionResponseData, MergePatchUpdate, OAuthLogin, OAuthLoginData, OAuthResult, PlainResult, Widget, WidgetList } from "../models.js";

export function decodeBase64(value: string): Uint8Array | undefined {
  if(!value) {
    return value as any;
  }
  // Normalize Base64URL to Base64
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    .padEnd(value.length + (4 - (value.length % 4)) % 4, '=');

  return new Uint8Array(Buffer.from(base64, 'base64'));
}export function encodeUint8Array(
  value: Uint8Array | undefined | null,
  encoding: BufferEncoding,
): string | undefined {
  if (!value) {
    return value as any;
  }
  return Buffer.from(value).toString(encoding);
}export function dateDeserializer(date?: string | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date);
}export function dateRfc7231Deserializer(date?: string | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date);
}export function dateRfc3339Serializer(date?: Date | null): string {
  if (!date) {
    return date as any
  }

  return date.toISOString();
}export function dateRfc7231Serializer(date?: Date | null): string {
  if (!date) {
    return date as any;
  }

  return date.toUTCString();
}export function dateUnixTimestampSerializer(date?: Date | null): number {
  if (!date) {
    return date as any;
  }

  return Math.floor(date.getTime() / 1000);
}export function dateUnixTimestampDeserializer(date?: number | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date * 1000);
}export function oauthPayloadToTransport(payload: OAuthResult) {
  return jsonOAuthResultToTransportTransform(payload)!;
}export function createPayloadToTransport(payload: Widget) {
  return jsonWidgetToTransportTransform(payload)!;
}export function updatePayloadToTransport(payload: MergePatchUpdate) {
  return jsonMergePatchUpdateToTransportTransform(payload)!;
}export function jsonWidgetListToTransportTransform(
  input_?: WidgetList | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    items: jsonArrayWidgetToTransportTransform(input_.items)
  }!;
}export function jsonWidgetListToApplicationTransform(
  input_?: any,
): WidgetList {
  if(!input_) {
    return input_ as any;
  }
    return {
    items: jsonArrayWidgetToApplicationTransform(input_.items)
  }!;
}export function jsonArrayWidgetToTransportTransform(
  items_?: Array<Widget> | null,
): any {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonWidgetToTransportTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonArrayWidgetToApplicationTransform(
  items_?: any,
): Array<Widget> {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonWidgetToApplicationTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonWidgetToTransportTransform(input_?: Widget | null): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,weight: input_.weight,color: input_.color
  }!;
}export function jsonWidgetToApplicationTransform(input_?: any): Widget {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,weight: input_.weight,color: input_.color
  }!;
}export function jsonMergePatchUpdateToTransportTransform(
  input_?: MergePatchUpdate | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,weight: input_.weight,color: input_.color
  }!;
}export function jsonMergePatchUpdateToApplicationTransform(
  input_?: any,
): MergePatchUpdate {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,weight: input_.weight,color: input_.color
  }!;
}export function jsonAnalyzeResultToTransportTransform(
  input_?: AnalyzeResult | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,analysis: input_.analysis
  }!;
}export function jsonAnalyzeResultToApplicationTransform(
  input_?: any,
): AnalyzeResult {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,analysis: input_.analysis
  }!;
}export function jsonOAuthLoginToTransportTransform(
  input_?: OAuthLogin | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    data: jsonOAuthLoginDataToTransportTransform(input_.data),result_code: input_.resultCode
  }!;
}export function jsonOAuthLoginToApplicationTransform(
  input_?: any,
): OAuthLogin {
  if(!input_) {
    return input_ as any;
  }
    return {
    data: jsonOAuthLoginDataToApplicationTransform(input_.data),resultCode: input_.result_code
  }!;
}export function jsonOAuthLoginDataToTransportTransform(
  input_?: OAuthLoginData | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    url: input_.url
  }!;
}export function jsonOAuthLoginDataToApplicationTransform(
  input_?: any,
): OAuthLoginData {
  if(!input_) {
    return input_ as any;
  }
    return {
    url: input_.url
  }!;
}export function jsonOAuthResultToTransportTransform(
  input_?: OAuthResult | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    code: input_.code,state: input_.state
  }!;
}export function jsonOAuthResultToApplicationTransform(
  input_?: any,
): OAuthResult {
  if(!input_) {
    return input_ as any;
  }
    return {
    code: input_.code,state: input_.state
  }!;
}export function jsonPlainResultToTransportTransform(
  input_?: PlainResult | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    result_code: input_.resultCode
  }!;
}export function jsonPlainResultToApplicationTransform(
  input_?: any,
): PlainResult {
  if(!input_) {
    return input_ as any;
  }
    return {
    resultCode: input_.result_code
  }!;
}export function jsonLoginSessionResponseToTransportTransform(
  input_?: LoginSessionResponse | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    result_code: input_.resultCode,data: jsonLoginSessionResponseDataToTransportTransform(input_.data)
  }!;
}export function jsonLoginSessionResponseToApplicationTransform(
  input_?: any,
): LoginSessionResponse {
  if(!input_) {
    return input_ as any;
  }
    return {
    resultCode: input_.result_code,data: jsonLoginSessionResponseDataToApplicationTransform(input_.data)
  }!;
}export function jsonLoginSessionResponseDataToTransportTransform(
  input_?: LoginSessionResponseData | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    name: input_.name,mail: input_.mail
  }!;
}export function jsonLoginSessionResponseDataToApplicationTransform(
  input_?: any,
): LoginSessionResponseData {
  if(!input_) {
    return input_ as any;
  }
    return {
    name: input_.name,mail: input_.mail
  }!;
}