use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use postgresql::custom::app_set_check_login_session;
use serde_json::json;
use tower_sessions::Session;
use uuid::Uuid;

use crate::{
    AppState,
    controllers::{ResponseType, SESSION_UUID, make_response},
    error::ApiError,
};

pub async fn execute(State(state): State<Arc<AppState>>, session: Session) -> impl IntoResponse {
    make_response(inner(session, &state.pg_pool).await)
}

async fn inner(session: Session, pg_pool: &sqlx::PgPool) -> Result<ResponseType, ApiError> {
    let Some(session_uuid) = session.get::<Uuid>(SESSION_UUID).await? else {
        return Err(ApiError::Invalid("Session not found".to_string()));
    };

    let params = app_set_check_login_session::DbInput {
        session_uuid,
        ..Default::default()
    };
    match app_set_check_login_session::execute(pg_pool, params)
        .await?
        .first()
    {
        Some(res) => Ok(ResponseType::new_data(
            "success",
            json!({
                "name": res.name,
                "mail": res.mail,
            }),
        )),
        None => Err(ApiError::Login("Session not found".to_string())),
    }
}
