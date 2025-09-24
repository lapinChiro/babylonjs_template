use axum::response::IntoResponse;
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Invalid {0}")]
    Invalid(String),

    #[error("Session {0}")]
    Session(#[from] tower_sessions::session::Error),

    #[error("Url {0}")]
    GoogleLogin(#[from] google_login::error::GoogleLoginError),

    #[error("Sql {0}")]
    Sql(#[from] sqlx::Error),

    #[error("Login {0}")]
    Login(String),
}

impl ApiError {
    pub fn make_response(&self) -> impl IntoResponse {
        match self {
            ApiError::Invalid(err) => (
                axum::http::StatusCode::BAD_REQUEST,
                axum::Json(json!({"result_code": "invalid", "message": err.to_string()})),
            ),
            ApiError::Login(err) => (
                axum::http::StatusCode::BAD_REQUEST,
                axum::Json(json!({"result_code": "login failed", "message": err.to_string()})),
            ),
            ApiError::Session(err) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json(json!({"result_code": "session_error", "message": err.to_string()})),
            ),
            ApiError::GoogleLogin(err) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json(
                    json!({"result_code": "google_login_error", "message": err.to_string()}),
                ),
            ),
            ApiError::Sql(err) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json(json!({"result_code": "sql_error", "message": err.to_string()})),
            ),
        }
    }
}
