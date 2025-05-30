use sqlx::PgPool;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use derive_builder::Builder;
use sqlx::prelude::*;

const SELECT_SQL: &str = r#"
SELECT
    t1.uuid
    ,t1.user_uuid
    ,t1.title
    ,t1.content
    ,t1.parent_memo_uuid
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
    public.memos AS t1
WHERE
    TRUE
    AND ($1 IS NULL OR t1.uuid = $1)
    AND ($2 IS NULL OR t1.user_uuid = $2)
    AND ($3 IS NULL OR t1.title = $3)
    AND ($4 IS NULL OR t1.content = $4)
    AND ($5 IS NULL OR t1.parent_memo_uuid = $5)
    AND ($6 IS NULL OR t1.created_uuid = $6)
    AND ($7 IS NULL OR t1.updated_uuid = $7)
    AND ($8 IS NULL OR t1.deleted_uuid = $8)
    AND ($9 IS NULL OR t1.created_at = $9)
    AND ($10 IS NULL OR t1.updated_at = $10)
    AND ($11 IS NULL OR t1.deleted_at = $11)
    AND ($12 IS NULL OR t1.created_pg = $12)
    AND ($13 IS NULL OR t1.updated_pg = $13)
    AND ($14 IS NULL OR t1.deleted_pg = $14)
    AND ($15 IS NULL OR t1.bk = $15)
"#;

const INSERT_SQL: &str = r#"
INSERT INTO public.memos (
    uuid
    ,user_uuid
    ,title
    ,content
    ,parent_memo_uuid
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
    ,$15
) RETURNING
    uuid
    ,user_uuid
    ,title
    ,content
    ,parent_memo_uuid
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
UPDATE public.memos AS t1 SET
    user_uuid = $2
    ,title = $3
    ,content = $4
    ,parent_memo_uuid = $5
    ,created_uuid = $6
    ,updated_uuid = $7
    ,deleted_uuid = $8
    ,created_at = $9
    ,updated_at = $10
    ,deleted_at = $11
    ,created_pg = $12
    ,updated_pg = $13
    ,deleted_pg = $14
    ,bk = $15
WHERE
    t1.uuid = $1
RETURNING
    uuid
    ,user_uuid
    ,title
    ,content
    ,parent_memo_uuid
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
DELETE FROM public.memos AS t1
WHERE
    t1.uuid = $1
RETURNING
    uuid
    ,user_uuid
    ,title
    ,content
    ,parent_memo_uuid
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
DELETE FROM public.memos AS t1
"#;

#[derive(Serialize, Deserialize, Debug, Clone, Builder, Default, FromRow)]
#[builder(setter(into))]
#[builder(default)]
#[builder(field(public))]
pub struct Memos {
    pub uuid: Uuid,
    pub user_uuid: Uuid,
    pub title: String,
    pub content: String,
    pub parent_memo_uuid: Uuid,
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

impl Memos {
    pub async fn insert(&self, pg_pool: &PgPool) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(INSERT_SQL)
            .bind(self.uuid)
            .bind(self.user_uuid)
            .bind(&self.title)
            .bind(&self.content)
            .bind(self.parent_memo_uuid)
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

    pub async fn update(&self, pg_pool: &PgPool) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(UPDATE_SQL)
            .bind(self.uuid)
            .bind(self.user_uuid)
            .bind(&self.title)
            .bind(&self.content)
            .bind(self.parent_memo_uuid)
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

    pub async fn delete(&self, pg_pool: &PgPool) -> Result<Self, sqlx::Error> {
        Self::delete_one(pg_pool, &self.uuid).await
    }

    pub async fn delete_one(pg_pool: &PgPool, uuid: &Uuid) -> Result<Self, sqlx::Error> {
        let res: Self = sqlx::query_as(DELETE_SQL)
            .bind(uuid)
            .fetch_one(pg_pool)
            .await?;
        Ok(res)
    }

    pub async fn delete_all(pg_pool: &PgPool) -> Result<(), sqlx::Error> {
        let _ = sqlx::query(DELETE_ALL_SQL)
            .execute(pg_pool)
            .await?;
        Ok(())
    }

    pub async fn select_all(pg_pool: &PgPool) -> Result<Vec<Self>, sqlx::Error> {
        let builder = MemosBuilder::default();
        Self::select(pg_pool, builder).await
    }

    pub async fn select_one(pg_pool: &PgPool, uuid: &Uuid) -> Result<Option<Self>, sqlx::Error> {
        let mut builder = MemosBuilder::default();
        builder.uuid(*uuid);
        let res = Self::select(pg_pool, builder).await?;
        Ok(res.first().cloned())
    }

    pub async fn select(pg_pool: &PgPool, builder: MemosBuilder) -> Result<Vec<Self>, sqlx::Error> {
        let rows: Vec<Self> = sqlx::query_as(SELECT_SQL)
            .bind(builder.uuid)
            .bind(builder.user_uuid)
            .bind(&builder.title)
            .bind(&builder.content)
            .bind(builder.parent_memo_uuid)
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
