import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Game from './game.js'
import User from './user.js'

export default class Turn extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare gameId: string

  @column()
  declare playerId: string

  @column()
  declare attackX: number

  @column()
  declare attackY: number

  @column()
  declare isHit: boolean

  @column()
  declare turnNumber: number

  @belongsTo(() => Game, { foreignKey: 'gameId' })
  declare game: BelongsTo<typeof Game>

  @belongsTo(() => User, { foreignKey: 'playerId' })
  declare player: BelongsTo<typeof User>
}
