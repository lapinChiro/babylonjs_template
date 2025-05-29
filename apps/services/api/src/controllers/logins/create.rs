use std::{sync::Arc, time::Duration};

use axum::{Json, extract::State, response::IntoResponse};
use google_login::{Oauth2Client, request_user_info};
use postgresql::custom::app_set_add_login_session;
use tower_sessions::Session;

use crate::{
    AppState,
    controllers::{ResponseType, SESSION_PKCE_VERIFIER, SESSION_UUID, make_response},
    error::ApiError,
};

pub async fn execute(
    State(state): State<Arc<AppState>>,
    session: Session,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    make_response(inner(&state.oauth2_client, payload, session, &state.pg_pool).await)
}

async fn inner(
    oauth2_client: &Oauth2Client,
    payload: serde_json::Value,
    session: Session,
    pg_pool: &sqlx::PgPool,
) -> Result<ResponseType, ApiError> {
    let Some(pkce) = session.remove::<String>(SESSION_PKCE_VERIFIER).await? else {
        return Err(ApiError::Invalid("PKCE verifier not found".to_string()));
    };
    let code = payload
        .get("code")
        .and_then(|v| v.as_str())
        .ok_or_else(|| ApiError::Invalid("Code not found".to_string()))?;

    let _state = payload
        .get("state")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    let res = oauth2_client
        .token(&pkce, code, Duration::from_secs(5))
        .await?;
    let user_info = request_user_info(&res.access_token, Duration::from_secs(5)).await?;

    let params = app_set_add_login_session::DbInput {
        user_code: user_info.id.clone(),
        name: user_info
            .name
            .as_ref()
            .map_or_else(|| "".to_string(), |n| n.clone()),
        mail: user_info.email.clone(),
        ..Default::default()
    };
    let res = app_set_add_login_session::execute(pg_pool, params).await?;
    let Some(session_uuid) = res.first().map(|r| r.session_uuid) else {
        return Err(ApiError::Invalid("Session creation failed".to_string()));
    };
    session.insert(SESSION_UUID, session_uuid).await?;
    Ok(ResponseType::new_no_data("success"))
}
