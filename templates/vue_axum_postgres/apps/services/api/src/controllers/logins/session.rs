use std::sync::Arc;

use axum::{extract::State, response::IntoResponse};
use serde_json::json;
use tower_sessions::Session;

use crate::{
    controllers::{get_session, make_response, ResponseType}, error::ApiError, AppState
};

pub async fn execute(State(state): State<Arc<AppState>>, session: Session) -> impl IntoResponse {
    make_response(inner(session, &state.pg_pool).await)
}

async fn inner(session: Session, pg_pool: &sqlx::PgPool) -> Result<ResponseType, ApiError> {
    let res = get_session(&pg_pool, &session).await?;

    Ok(ResponseType::new_data(
            "success",
            json!({
                "name": res.name,
                "mail": res.mail,
            }),
        ))
}
