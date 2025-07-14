import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, beforeSave, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import hash from '@adonisjs/core/services/hash'
import { v4 as uuidv4 } from 'uuid'
import Room from './room.js'
import Game from './game.js'
import Turn from './turn.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare wins: number

  @column()
  declare losses: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = uuidv4()
  }

  @beforeSave()
  static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }

  @hasMany(() => Room, { foreignKey: 'player1Id' })
  declare roomsAsPlayer1: HasMany<typeof Room>

  @hasMany(() => Room, { foreignKey: 'player2Id' })
  declare roomsAsPlayer2: HasMany<typeof Room>

  @hasMany(() => Game, { foreignKey: 'player1Id' })
  declare gamesAsPlayer1: HasMany<typeof Game>

  @hasMany(() => Game, { foreignKey: 'player2Id' })
  declare gamesAsPlayer2: HasMany<typeof Game>

  @hasMany(() => Turn, { foreignKey: 'playerId' })
  declare turns: HasMany<typeof Turn>
}
