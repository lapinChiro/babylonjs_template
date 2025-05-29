use chrono::prelude::*;
use derive_builder::Builder;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use sqlx::prelude::*;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone, Builder, Default, PartialEq, Eq)]
#[builder(setter(into))]
#[builder(default)]
#[builder(field(public))]
pub struct DbInput {
    pub session_uuid: Uuid,
    pub now: Option<DateTime<Utc>>,
    pub pg: Option<String>,
    pub operator_uuid: Option<Uuid>,
}

#[derive(Serialize, Deserialize, Debug, Clone, Builder, Default, PartialEq, Eq, FromRow)]
#[builder(setter(into))]
#[builder(default)]
#[builder(field(public))]
pub struct DbOutput {
    pub name: String,
    pub mail: String,
}

const SQL: &str = r#"
SELECT
    t1.*
FROM
    app_set_check_login_session(
        p_session_uuid := $1
        ,p_now := $2
        ,p_pg := $3
        ,p_operator_uuid := $4
    ) AS t1
"#;

pub async fn execute(pg_pool: &PgPool, params: DbInput) -> Result<Vec<DbOutput>, sqlx::Error> {
    let res: Vec<DbOutput> = sqlx::query_as(SQL)
        .bind(params.session_uuid)
        .bind(params.now)
        .bind(&params.pg)
        .bind(params.operator_uuid)
        .fetch_all(pg_pool)
        .await?;
    Ok(res)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{prelude::*, tests::setup};

    // RUST_LOG=info REALM_CODE=test cargo test -p postgresql test_postgresql_app_set_check_login_session -- --nocapture --test-threads=1
    #[tokio::test]
    async fn test_postgresql_app_set_check_login_session() -> anyhow::Result<()> {
        let pg_pool = setup().await?;

        let _builder = UsersBuilder::default();

        let params = DbInput {
            ..Default::default()
        };

        let result = execute(&pg_pool, params).await?;
        assert_eq!(result.len(), 0);

        Ok(())
    }
}
