use axum::response::{IntoResponse, Redirect};
use serde::Serialize;
use tower_sessions::Session;
use uuid::Uuid;

use crate::error::ApiError;
use postgresql::custom::app_set_check_login_session;

pub mod logins;
pub mod memos;

pub const SESSION_PKCE_VERIFIER: &str = "pkce_verifier";
pub const SESSION_UUID: &str = "session_uuid";

pub enum ResponseType {
    List((String, Vec<serde_json::Value>)),
    Data((String, serde_json::Value)),
    Redirect(String),
    NoData(String),
}

impl ResponseType {
    pub fn new_no_data(result_code: &str) -> Self {
        Self::NoData(result_code.to_owned())
    }

    pub fn new_list(result_code: &str, list: Vec<serde_json::Value>) -> Self {
        Self::List((result_code.to_owned(), list))
    }

    pub fn new_data<T>(result_code: &str, data: T) -> Self 
    where 
        T: Serialize
    {
        Self::Data((result_code.to_owned(), serde_json::to_value(data).unwrap()))
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
            Self::List((key, list)) => {
                let response = serde_json::json!({
                    "result_code": key,
                    "list": list,
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


pub async fn get_session(pg_pool: &sqlx::PgPool, session: &Session) -> Result<app_set_check_login_session::DbOutput, ApiError> {
    let Some(session_uuid) = session.get::<Uuid>(SESSION_UUID).await? else {
        return Err(ApiError::Invalid("Session not found".to_string()));
    };

    let params = app_set_check_login_session::DbInput {
        session_uuid,
        ..Default::default()
    };
    let list = app_set_check_login_session::execute(pg_pool, params).await?;
    list.first()
        .cloned()
        .ok_or_else(|| ApiError::Login("Session not found".to_string()))
}