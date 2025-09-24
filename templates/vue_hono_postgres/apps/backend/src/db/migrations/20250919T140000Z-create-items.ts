import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('items')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo('now()').notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo('now()').notNull()
    )
    .execute()

  // Create index for name
  await db.schema.createIndex('idx_items_name')
    .on('items')
    .column('name')
    .execute()

  // Insert initial data with demo items
  await db
    .insertInto('items')
    .values([
      { name: 'MacBook Pro' },
      { name: 'iPhone 15' },
      { name: 'iPad Air' },
      { name: 'AirPods Pro' },
      { name: 'Magic Mouse' },
      { name: 'Studio Display' }
    ])
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_items_name').execute()
  await db.schema.dropTable('items').execute()
}