use axum::response::IntoResponse;
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiError {
    #[error("Invalid {0}")]
    Invalid(String),

    #[error("Sql {0}")]
    Sql(#[from] sqlx::Error),
}

impl ApiError {
    pub fn make_response(&self) -> impl IntoResponse {
        match self {
            ApiError::Invalid(err) => (
                axum::http::StatusCode::BAD_REQUEST,
                axum::Json(json!({"result_code": "invalid", "message": err.to_string()})),
            ),
            ApiError::Sql(err) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                axum::Json(json!({"result_code": "sql_error", "message": err.to_string()})),
            ),
        }
    }
}