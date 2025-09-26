use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use serde_json::json;
use tower_sessions::Session;
use uuid::Uuid;
use postgresql::custom::app_set_delete_login_session;

use crate::{
    controllers::{make_response, ResponseType, SESSION_UUID},
    error::ApiError, AppState,
};

pub async fn execute(State(state): State<Arc<AppState>>, session: Session) -> impl IntoResponse {
    make_response(inner(session, &state.pg_pool).await)
}

async fn inner(session: Session, pg_pool: &sqlx::PgPool) -> Result<ResponseType, ApiError> {
    let result = Ok(ResponseType::new_data("success", json!({})));
    let Some(session_uuid) = session.get::<Uuid>(SESSION_UUID).await? else {
        return result
    };
    let params = app_set_delete_login_session::DbInput {
        session_uuid,
        ..Default::default()
    };
    let _ = app_set_delete_login_session::execute(pg_pool, params).await?;
    session.clear().await;
    result
}
