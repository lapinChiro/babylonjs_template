use crate::Pool;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use derive_builder::Builder;
use sqlx::prelude::*;

const SELECT_SQL: &str = r#"
SELECT
    t1.uuid
    ,t1.user_code
    ,t1.name
    ,t1.mail
    ,t1.created_uuid
    ,t1.updated_uuid
    ,t1.deleted_uuid
    ,t1.created_at
    ,t1.updated_at
    ,t1.deleted_at
    ,t1.created_pg
    ,t1.updated_pg
    ,t1.deleted_pg
    ,t1.bk
FROM
    public.users AS t1
WHERE
    TRUE
    AND ($1 IS NULL OR t1.uuid = $1)
    AND ($2 IS NULL OR t1.user_code = $2)
    AND ($3 IS NULL OR t1.name = $3)
    AND ($4 IS NULL OR t1.mail = $4)
    AND ($5 IS NULL OR t1.created_uuid = $5)
    AND ($6 IS NULL OR t1.updated_uuid = $6)
    AND ($7 IS NULL OR t1.deleted_uuid = $7)
    AND ($8 IS NULL OR t1.created_at = $8)
    AND ($9 IS NULL OR t1.updated_at = $9)
    AND ($10 IS NULL OR t1.deleted_at = $10)
    AND ($11 IS NULL OR t1.created_pg = $11)
    AND ($12 IS NULL OR t1.updated_pg = $12)
    AND ($13 IS NULL OR t1.deleted_pg = $13)
    AND ($14 IS NULL OR t1.bk = $14)
"#;

const INSERT_SQL: &str = r#"
INSERT INTO public.users (
    uuid
    ,user_code
    ,name
    ,mail
    ,created_uuid
    ,updated_uuid
    ,deleted_uuid
    ,created_at
    ,updated_at
    ,deleted_at
    ,created_pg
    ,updated_pg
    ,deleted_pg
    ,bk
) VALUES (
    $1
    ,$2
    ,$3
    ,$4
    ,$5
    ,$6
    ,$7
    ,$8
    ,$9
    ,$10
    ,$11
    ,$12
    ,$13
    ,$14
) RETURNING
    uuid
    ,user_code
    ,name
    ,mail
    ,created_uuid
    ,updated_uuid
    ,deleted_uuid
    ,created_at
    ,updated_at
    ,deleted_at
    ,created_pg
    ,updated_pg
    ,deleted_pg
    ,bk
"#;

const UPDATE_SQL: &str = r#"
UPDATE public.users AS t1 SET
    user_code = $2
    ,name = $3
    ,mail = $4
    ,created_uuid = $5
    ,updated_uuid = $6
    ,deleted_uuid = $7
    ,created_at = $8
    ,updated_at = $9
    ,deleted_at = $10
    ,created_pg = $11
    ,updated_pg = $12
    ,deleted_pg = $13
    ,bk = $14
WHERE
    t1.uuid = $1
RETURNING
    uuid
    ,user_code
    ,name
    ,mail
    ,created_uuid
    ,updated_uuid
    ,deleted_uuid
    ,created_at
    ,updated_at
    ,deleted_at
    ,created_pg
    ,updated_pg
    ,deleted_pg
    ,bk
"#;

const DELETE_SQL: &str = r#"
DELETE FROM public.users AS t1
WHERE
    t1.uuid = $1
RETURNING
    uuid
    ,user_code
    ,name
    ,mail
    ,created_uuid
    ,updated_uuid
    ,deleted_uuid
    ,created_at
    ,updated_at
    ,deleted_at
    ,created_pg
    ,updated_pg
    ,deleted_pg
    ,bk
"#;

const DELETE_ALL_SQL: &str = r#"
DELETE FROM public.users AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Builder, Default, FromRow)]
#[builder(setter(into))]
#[builder(default)]
#[builder(field(public))]
pub struct Users {
    pub uuid: Uuid,
    pub user_code: String,
    pub name: String,
    pub mail: String,
    pub created_uuid: Option<Uuid>,
    pub updated_uuid: Option<Uuid>,
    pub deleted_uuid: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub created_pg: String,
    pub updated_pg: String,
    pub deleted_pg: String,
    pub bk: Option<String>,
}

impl Users {
    pub async fn insert(&self, pg_pool: &Pool) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(INSERT_SQL)
            .bind(self.uuid)
            .bind(&self.user_code)
            .bind(&self.name)
            .bind(&self.mail)
            .bind(self.created_uuid)
            .bind(self.updated_uuid)
            .bind(self.deleted_uuid)
            .bind(self.created_at)
            .bind(self.updated_at)
            .bind(self.deleted_at)
            .bind(&self.created_pg)
            .bind(&self.updated_pg)
            .bind(&self.deleted_pg)
            .bind(&self.bk)
            .fetch_one(pg_pool)
            .await?;
        Ok(res)
    }

    pub async fn update(&self, pg_pool: &Pool) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(UPDATE_SQL)
            .bind(self.uuid)
            .bind(&self.user_code)
            .bind(&self.name)
            .bind(&self.mail)
            .bind(self.created_uuid)
            .bind(self.updated_uuid)
            .bind(self.deleted_uuid)
            .bind(self.created_at)
            .bind(self.updated_at)
            .bind(self.deleted_at)
            .bind(&self.created_pg)
            .bind(&self.updated_pg)
            .bind(&self.deleted_pg)
            .bind(&self.bk)
            .fetch_one(pg_pool)
            .await?;
        Ok(res)
    }

    pub async fn delete(&self, pg_pool: &Pool) -> Result<Self, sqlx::Error> {
        Self::delete_one(pg_pool, &self.uuid).await
    }

    pub async fn delete_one(pg_pool: &Pool, uuid: &Uuid) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(DELETE_SQL)
            .bind(uuid)
            .fetch_one(pg_pool)
            .await?;
        Ok(res)
    }

    pub async fn delete_all(pg_pool: &Pool) -> Result<(), sqlx::Error> {
        let _ = sqlx::query(DELETE_ALL_SQL)
            .execute(pg_pool)
            .await?;
        Ok(())
    }

    pub async fn select_all(pg_pool: &Pool) -> Result<Vec<Self>, sqlx::Error> {
        let builder = UsersBuilder::default();
        Self::select(pg_pool, builder).await
    }

    pub async fn select_one(pg_pool: &Pool, uuid: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let mut builder = UsersBuilder::default();
        builder.uuid(*uuid);
        let res = Self::select(pg_pool, builder).await?;
        Ok(res.first().cloned())
    }

    pub async fn select(pg_pool: &Pool, builder: UsersBuilder) -> Result<Vec<Self>, sqlx::Error> {
        let rows: Vec<Self> = sqlx::query_as(SELECT_SQL)
            .bind(builder.uuid)
            .bind(&builder.user_code)
            .bind(&builder.name)
            .bind(&builder.mail)
            .bind(builder.created_uuid)
            .bind(builder.updated_uuid)
            .bind(builder.deleted_uuid)
            .bind(builder.created_at)
            .bind(builder.updated_at)
            .bind(builder.deleted_at)
            .bind(&builder.created_pg)
            .bind(&builder.updated_pg)
            .bind(&builder.deleted_pg)
            .bind(&builder.bk)
            .fetch_all(pg_pool)
            .await?;
        Ok(rows)
    }
}
