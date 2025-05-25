use axum::response::IntoResponse;
use google_login::UserInfo;
use serde_json::json;
use tower_sessions::Session;

use crate::{
    controllers::{make_response, ResponseType, SESSION_USER_INFO},
    error::ApiError,
};

pub async fn execute(session: Session) -> impl IntoResponse {
    make_response(inner(session).await)
}

async fn inner(session: Session) -> Result<ResponseType, ApiError> {
    let Some(user_info) = session.get::<UserInfo>(SESSION_USER_INFO).await? else {
        return Err(ApiError::Invalid("Session not found".to_string()));
    };
    Ok(ResponseType::new_data("success", json!({
        "name": user_info.name,
        "email": user_info.email,
    })))
}
