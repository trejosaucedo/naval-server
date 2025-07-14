import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rooms'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.uuid('player_1_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('player_2_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.enum('status', ['waiting', 'full', 'started', 'finished']).defaultTo('waiting')
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
