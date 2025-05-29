export type String = string;
export interface WidgetList {
  items: Array<Widget>;
}

export interface Widget {
  id: string
  weight: number
  color: "red" | "blue";
}
export type Int32 = number;
export type Int64 = bigint;
export type Integer = number;
export type Numeric = number;
export interface MergePatchUpdate {
  id?: string
  weight?: number
  color?: "red" | "blue";
}
export interface AnalyzeResult {
  id: string
  analysis: string;
}
export interface OAuthLogin {
  data: OAuthLoginData
  resultCode: string;
}
export interface OAuthLoginData {
  url: string;
}
export interface OAuthResult {
  code: string
  state: string;
}
export interface PlainResult {
  resultCode: string;
}
export interface LoginSessionResponse {
  resultCode: string
  data: LoginSessionResponseData;
}
export interface LoginSessionResponseData {
  name: string
  mail: string;
}