import { GameRepository } from '#repositories/game_repository'
import type { GameStateResponseDto, GameHistoryItemDto, GameDetailsResponseDto } from '#dtos/game'
import Game from '#models/game'
import Turn from '#models/turn'
import User from '#models/user'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/db'

export class GameService {
  private repo = new GameRepository()

  async getById(gameId: string) {
    return this.repo.findById(gameId)
  }

  async getState(game: Game, userId: string): Promise<GameStateResponseDto | null> {
    if (![game.player1Id, game.player2Id].includes(userId)) return null
    await game.load('player1')
    await game.load('player2')
    await game.load('turns')
    const isPlayer1 = game.player1Id === userId
    return {
      game_id: game.id,
      status: game.status,
      current_turn: game.currentTurn,
      is_my_turn: game.canPlayerMove(userId),
      my_board: isPlayer1 ? game.player1InitialBoard : game.player2InitialBoard,
      opponent_board: isPlayer1 ? game.player2InitialBoard : game.player1InitialBoard,
      my_attacks: game.getPlayerAttacks(userId),
      opponent_attacks: game.getOpponentAttacks(userId),
      player1: { id: game.player1.id, name: game.player1.name },
      player2: { id: game.player2.id, name: game.player2.name },
      winner_id: game.winnerId,
      my_hits: game.countHits(userId),
      opponent_hits: isPlayer1 ? game.countHits(game.player2Id) : game.countHits(game.player1Id),
    }
  }

async attack(game: Game, userId: string, x: number, y: number) {
  if (![game.player1Id, game.player2Id].includes(userId))
    throw new Error('No tienes acceso a este juego')
  await game.load('turns')
  if (!game.canPlayerMove(userId)) throw new Error('No es tu turno o el juego ha terminado')
  if (game.hasAttackedPosition(userId, x, y)) throw new Error('Ya atacaste esa posición')

  const trx = await Database.transaction()
  try {
    const opponentBoard = game.getOpponentBoard(userId)
    const isHit = opponentBoard[x][y] === 1

    console.log('[DEBUG] Atacando posición:', x, y, 'isHit:', isHit)

    const maxResult = (await Turn.query({ client: trx })
      .where('game_id', game.id)
      .max('turn_number as max')) as unknown as { max: number | null }[]

    const turnNumber = Number(maxResult[0]?.max) || 0

    // CREA EL TURNO DEL ATAQUE
    await Turn.create(
      {
        gameId: game.id,
        playerId: userId,
        attackX: x,
        attackY: y,
        isHit,
        turnNumber: turnNumber + 1,
      },
      { client: trx }
    )

    // GUARDA JUEGO Y TERMINA LA TRANSACCIÓN
    game.useTransaction(trx)
    await game.save()
    await trx.commit()

    // *** AHORA recarga los turns fuera del commit ***
    await game.load('turns', (query) => query.orderBy('turn_number', 'asc'))

    // LOGS PARA DEBUG
    const hits = game.turns.filter(t => t.playerId === userId && t.isHit).length
    console.log('[DEBUG] Post-commit hits para', userId, ':', hits)
    game.turns.forEach(t => {
      console.log('[DEBUG TURN]', {
        playerId: t.playerId,
        turnNumber: t.turnNumber,
        attackX: t.attackX,
        attackY: t.attackY,
        isHit: t.isHit,
      })
    })

    let finished = false
    if (game.checkWinner(userId)) {
      console.log('[DEBUG] ¡DETECTADO WINNER! userId:', userId)
      game.status = 'finished'
      game.winnerId = userId
      game.finishedAt = DateTime.local()
      // Actualiza wins/losses fuera de la transacción
      const winner = await User.find(userId)
      const loserId = userId === game.player1Id ? game.player2Id : game.player1Id
      const loser = await User.find(loserId)
      if (winner) await winner.merge({ wins: winner.wins + 1 }).save()
      if (loser) await loser.merge({ losses: loser.losses + 1 }).save()
      finished = true
      await game.save()
    } else {
      game.currentTurn = game.currentTurn === 1 ? 2 : 1
      await game.save()
    }

    return {
      success: true,
      hit: isHit,
      winner_id: game.winnerId,
      game_finished: finished,
      current_turn: game.currentTurn,
      my_hits: game.countHits(userId),
    }
  } catch (error) {
    await trx.rollback()
    throw error
  }
}



  async getHistory(userId: string): Promise<GameHistoryItemDto[]> {
    const games = await this.repo.getHistoryByUserId(userId)
    return games.map((game) => {
      const isPlayer1 = game.player1Id === userId
      const opponent = isPlayer1 ? game.player2 : game.player1
      const won = game.winnerId === userId
      return {
        id: game.id,
        opponent: opponent?.name ?? '',
        won,
        finished_at: game.finishedAt?.toFormat('dd/MM/yyyy HH:mm') ?? '',
        my_hits: game.countHits(userId),
        opponent_hits: isPlayer1 ? game.countHits(game.player2Id) : game.countHits(game.player1Id),
      }
    })
  }

  async getDetails(game: Game, userId: string): Promise<GameDetailsResponseDto | null> {
    if (![game.player1Id, game.player2Id].includes(userId)) return null

    await game.load('player1')
    await game.load('player2')
    await game.load('turns', (builder) => builder.preload('player'))

    return {
      game: {
        id: game.id,
        status: game.status,
        started_at: game.startedAt?.toFormat('dd/MM/yyyy HH:mm') ?? '',
        finished_at: game.finishedAt?.toFormat('dd/MM/yyyy HH:mm') ?? null,
        winner_id: game.winnerId,
      },
      players: {
        player1: game.player1?.name ?? '',
        player2: game.player2?.name ?? '',
      },
      boards: {
        my_board: game.getPlayerBoard(userId),
        opponent_board: game.getOpponentBoard(userId),
      },
      attacks: {
        my_attacks: game.getPlayerAttacks(userId),
        opponent_attacks: game.getPlayerAttacks(
          userId === game.player1Id ? game.player2Id : game.player1Id
        ),
      },
      turns: game.turns,
    }
  }

  async abandon(game: Game, userId: string) {
    if (![game.player1Id, game.player2Id].includes(userId))
      throw new Error('No tienes acceso a este juego')
    if (game.status !== 'playing') throw new Error('El juego ya ha terminado')
    const trx = await Database.transaction()
    try {
      const opponentId = userId === game.player1Id ? game.player2Id : game.player1Id
      game.status = 'finished'
      game.winnerId = opponentId
      game.finishedAt = DateTime.local()
      game.useTransaction(trx)
      await game.save()
      const winner = await User.find(opponentId, { client: trx })
      const loser = await User.find(userId, { client: trx })
      if (winner) await winner.merge({ wins: winner.wins + 1 }).save()
      if (loser) await loser.merge({ losses: loser.losses + 1 }).save()
      await trx.commit()
      return {
        success: true,
        message: 'Partida abandonada exitosamente',
        winner_id: opponentId,
      }
    } catch (err) {
      await trx.rollback()
      throw err
    }
  }
}
