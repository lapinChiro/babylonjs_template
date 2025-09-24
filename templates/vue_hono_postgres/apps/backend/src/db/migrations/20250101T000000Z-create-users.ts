import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
    .addColumn('password_hash', 'varchar(255)', (col) => col.notNull())
    .addColumn('active', 'boolean', (col) => col.defaultTo(true).notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo('now()').notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo('now()').notNull()
    )
    .execute()

  // Create index for email
  await db.schema.createIndex('idx_users_email')
    .on('users')
    .column('email')
    .execute()

  // Insert initial data with demo accounts
  // Password for all accounts: password123
  const passwordHash = '$2b$10$TIMlZeMFkb9hYdp8EtHPTutZ/vXQEHG.CyAoJ/GF/W7LXS103hltS'

  await db
    .insertInto('users')
    .values([
      { name: 'Admin User', email: 'admin@test.com', password_hash: passwordHash, active: true }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_users_email').execute()
  await db.schema.dropTable('users').execute()
}