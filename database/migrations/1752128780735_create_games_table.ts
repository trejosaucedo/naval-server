import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'games'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('room_id').notNullable().references('id').inTable('rooms').onDelete('CASCADE')
      table.uuid('player1_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('player2_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.json('player1_initial_board').notNullable()
      table.json('player2_initial_board').notNullable()
      table.integer('current_turn').notNullable().defaultTo(1)
      table.enum('status', ['playing', 'finished']).defaultTo('playing')
      table.uuid('winner_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('started_at', { useTz: true }).notNullable()
      table.timestamp('finished_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
