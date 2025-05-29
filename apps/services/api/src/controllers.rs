use axum::response::{IntoResponse, Redirect};

use crate::error::ApiError;

pub mod logins;

pub const SESSION_PKCE_VERIFIER: &str = "pkce_verifier";
pub const SESSION_UUID: &str = "session_uuid";

pub enum ResponseType {
    Data((String, serde_json::Value)),
    Redirect(String),
    NoData(String),
}

impl ResponseType {
    pub fn new_no_data(result_code: &str) -> Self {
        Self::NoData(result_code.to_owned())
    }

    pub fn new_data(result_code: &str, data: serde_json::Value) -> Self {
        Self::Data((result_code.to_owned(), data))
    }

    pub fn new_redirect(path: &str) -> Self {
        Self::Redirect(path.to_owned())
    }

    pub fn make_response(&self) -> impl IntoResponse {
        match self {
            Self::Data((key, data)) => {
                let response = serde_json::json!({
                    "result_code": key,
                    "data": data,
                });
                axum::Json(response).into_response()
            }
            Self::Redirect(path) => Redirect::to(path).into_response(),
            Self::NoData(key) => {
                let response = serde_json::json!({
                    "result_code": key,
                });
                axum::Json(response).into_response()
            }
        }
    }
}

// レスポンスを作成する
pub fn make_response(res: Result<ResponseType, ApiError>) -> impl IntoResponse {
    match res {
        Ok(response_type) => response_type.make_response().into_response(),
        Err(err) => err.make_response().into_response(),
    }
}
