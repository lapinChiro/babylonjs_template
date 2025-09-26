pub mod table;

use crate::prelude::*;
use common::config::Config;
use sqlx::PgPool;

pub mod prelude {
    pub use crate::table::*;
}

async fn clear_db(pool: &PgPool) -> Result<(), sqlx::Error> {
    Users::delete_all(pool).await?;
    Ok(())
}

pub async fn setup_test(config: &Config) -> Result<PgPool, sqlx::Error> {
    let pool = config.pg_pool().await.unwrap();
    clear_db(&pool).await?;
    Ok(pool)
}

#[cfg(test)]
mod tests {
    use crate::setup_test;
    use common::config::Config;

    pub async fn setup() -> anyhow::Result<sqlx::PgPool> {
        let _ = env_logger::builder().is_test(true).try_init();
        let config = Config::setup();
        let pool = setup_test(&config).await?;
        Ok(pool)
    }
}