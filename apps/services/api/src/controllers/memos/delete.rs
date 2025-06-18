use std::sync::Arc;

use axum::{extract::{Path, State}, response::IntoResponse};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use tower_sessions::Session;
use uuid::Uuid;
use chrono::prelude::*;

use crate::{
    controllers::{get_session, make_response, ResponseType},
    error::ApiError, AppState,
};

pub async fn execute(Path(memo_uuid): Path<Uuid>, State(state): State<Arc<AppState>>, session: Session) -> impl IntoResponse {
    make_response(inner(session, &state.pg_pool, memo_uuid).await)
}

async fn inner(session: Session, pg_pool: &sqlx::PgPool, memo_uuid: Uuid) -> Result<ResponseType, ApiError> {
    let user = get_session(&pg_pool, &session).await?;
    let data = execute_db(&pg_pool, user.user_uuid, memo_uuid).await?;
    Ok(ResponseType::new_data(
        "success",
        data,
    ))
}

const SQL: &str = r#"
SELECT
    t1.uuid
FROM
    generated_get_delete_memos(
        p_uuid := $1
        ,p_user_uuid := $2
    ) AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Default, PartialEq, Eq, FromRow)]
pub struct DbOutput {
    pub uuid: Uuid,
}

async fn execute_db(pg_pool: &sqlx::PgPool, user_uuid: Uuid, memo_uuid: Uuid) -> Result<DbOutput, sqlx::Error> {
    let res: DbOutput = sqlx::query_as(SQL)
        .bind(user_uuid)
        .bind(memo_uuid)
        .fetch_one(pg_pool)
        .await?;
    Ok(res)
}