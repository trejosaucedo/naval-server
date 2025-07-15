import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import Room from './room.js'
import User from './user.js'
import Turn from './turn.js'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'room_id' })
  declare roomId: string

  @column({ columnName: 'player1_id' })
  declare player1Id: string

  @column({ columnName: 'player2_id' })
  declare player2Id: string

  @column({
    columnName: 'player1_initial_board',
    serializeAs: null,
    prepare: (value: number[][] | string) =>
      typeof value === 'string' ? value : JSON.stringify(value),
    consume: (value: string | number[][]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare player1InitialBoard: number[][]

  @column({
    columnName: 'player2_initial_board',
    serializeAs: null,
    prepare: (value: number[][] | string) =>
      typeof value === 'string' ? value : JSON.stringify(value),
    consume: (value: string | number[][]) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare player2InitialBoard: number[][]

  @column({ columnName: 'current_turn' })
  declare currentTurn: number

  @column()
  declare status: 'playing' | 'finished'

  @column({ columnName: 'winner_id' })
  declare winnerId: string | null

  @column.dateTime({ columnName: 'started_at' })
  declare startedAt: DateTime

  @column.dateTime({ columnName: 'finished_at' })
  declare finishedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(game: Game) {
    game.id = uuidv4()
  }

  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => User, { foreignKey: 'player1Id' })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'player2Id' })
  declare player2: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'winnerId' })
  declare winner: BelongsTo<typeof User>

  @hasMany(() => Turn, { foreignKey: 'gameId' })
  declare turns: HasMany<typeof Turn>

  static generateBoard(): number[][] {
    const board = Array.from({ length: 8 }, () => Array(8).fill(0))
    let ships = 0
    while (ships < 15) {
      const x = Math.floor(Math.random() * 8)
      const y = Math.floor(Math.random() * 8)
      if (board[x][y] === 0) {
        board[x][y] = 1
        ships++
      }
    }
    return board
  }

  canPlayerMove(userId: string): boolean {
    if (this.status !== 'playing') return false
    if (this.currentTurn === 1 && userId === this.player1Id) return true
    return this.currentTurn === 2 && userId === this.player2Id
  }

  hasAttackedPosition(userId: string, x: number, y: number): boolean {
    if (!Array.isArray(this.turns)) throw new Error('Turns must be loaded')
    return this.turns.some((t: Turn) => t.playerId === userId && t.attackX === x && t.attackY === y)
  }

  getPlayerAttacks(userId: string) {
    if (!Array.isArray(this.turns)) throw new Error('Turns must be loaded')
    return this.turns
      .filter((t) => t.playerId === userId)
      .sort((a, b) => a.turnNumber - b.turnNumber)
      .map((t) => ({
        x: t.attackX,
        y: t.attackY,
        hit: t.isHit,
      }))
  }

  getOpponentAttacks(userId: string) {
    if (!Array.isArray(this.turns)) throw new Error('Turns must be loaded')
    const opponentId = this.player1Id === userId ? this.player2Id : this.player1Id
    return this.turns
      .filter((t) => t.playerId === opponentId)
      .sort((a, b) => a.turnNumber - b.turnNumber)
      .map((t) => ({
        x: t.attackX,
        y: t.attackY,
        hit: t.isHit,
      }))
  }

  getPlayerBoard(userId: string): number[][] {
    return this.player1Id === userId ? this.player1InitialBoard : this.player2InitialBoard
  }

  getOpponentBoard(userId: string): number[][] {
    return this.player1Id === userId ? this.player2InitialBoard : this.player1InitialBoard
  }

  checkWinner(userId: string): boolean {
  if (!Array.isArray(this.turns)) throw new Error('Turns must be loaded')
  const hits = this.turns.filter((t) => t.playerId === userId && t.isHit).length
  console.log('[DEBUG][checkWinner] userId:', userId, 'hits:', hits)
  return hits >= 15
}



  countHits(userId: string): number {
    if (!Array.isArray(this.turns)) throw new Error('Turns must be loaded')
    return this.turns.filter((t) => t.playerId === userId && t.isHit).length
  }
}
