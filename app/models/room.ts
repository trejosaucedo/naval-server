import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'
import Game from './game.js'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare player1Id: string

  @column()
  declare player2Id: string | null

  @column()
  declare status: 'waiting' | 'full' | 'started' | 'finished'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(room: Room) {
    room.id = uuidv4()
  }

  @belongsTo(() => User, { foreignKey: 'player1Id' })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'player2Id' })
  declare player2: BelongsTo<typeof User>

  @hasOne(() => Game, { foreignKey: 'roomId' })
  declare game: HasOne<typeof Game>
}
