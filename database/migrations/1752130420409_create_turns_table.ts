import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'turns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE')
      table.uuid('player_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('attack_x').notNullable()
      table.integer('attack_y').notNullable()
      table.boolean('is_hit').notNullable()
      table.integer('turn_number').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
