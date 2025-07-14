import { StatsRepository } from '#repositories/stats_repository'
import type { StatsSummaryDto, StatsGameItemDto, GameDetailStatsDto } from '#dtos/stats'

export class StatsService {
  private repo = new StatsRepository()

  async getSummary(user: {
    id: string
  }): Promise<StatsSummaryDto & { gamesWon: StatsGameItemDto[]; gamesLost: StatsGameItemDto[] }> {
    const games = await this.repo.getFinishedGames(user.id)
    const won = games.filter((g) => g.winnerId === user.id)
    const lost = games.filter((g) => g.winnerId && g.winnerId !== user.id)
    const totalGames = won.length + lost.length
    const winRate = totalGames > 0 ? Math.round((won.length / totalGames) * 1000) / 10 : 0

    const mapGame = (g: any) => {
      const isPlayer1 = g.player1Id === user.id
      const opponent = isPlayer1 ? g.player2 : g.player1
      return {
        id: g.id,
        opponent_name: opponent?.name ?? 'Usuario desconocido',
        winner_name: g.winner?.name ?? null,
        finished_at: g.finishedAt ? g.finishedAt.toFormat('dd/MM/yyyy HH:mm') : 'Sin fecha',
        my_hits: g.countHits(user.id),
        opponent_hits: isPlayer1 ? g.countHits(g.player2Id) : g.countHits(g.player1Id),
      }
    }

    return {
      wins: won.length,
      losses: lost.length,
      totalGames,
      winRate,
      gamesWon: won.map(mapGame),
      gamesLost: lost.map(mapGame),
    }
  }

  async getWonGames(user: { id: string }): Promise<StatsGameItemDto[]> {
    const games = await this.repo.getWonGames(user.id)
    return games.map((g) => {
      const isPlayer1 = g.player1Id === user.id
      const opponent = isPlayer1 ? g.player2 : g.player1
      return {
        id: g.id,
        opponent_name: opponent?.name ?? 'Usuario desconocido',
        finished_at: g.finishedAt ? g.finishedAt.toFormat('dd/MM/yyyy HH:mm') : 'Sin fecha',
        my_hits: g.countHits(user.id),
        opponent_hits: isPlayer1 ? g.countHits(g.player2Id) : g.countHits(g.player1Id),
      }
    })
  }

  async getLostGames(user: { id: string }): Promise<StatsGameItemDto[]> {
    const games = await this.repo.getLostGames(user.id)
    return games.map((g) => {
      const isPlayer1 = g.player1Id === user.id
      const opponent = isPlayer1 ? g.player2 : g.player1
      return {
        id: g.id,
        opponent_name: opponent?.name ?? 'Usuario desconocido',
        winner_name: g.winner?.name ?? 'Ganador desconocido',
        finished_at: g.finishedAt ? g.finishedAt.toFormat('dd/MM/yyyy HH:mm') : 'Sin fecha',
        my_hits: g.countHits(user.id),
        opponent_hits: isPlayer1 ? g.countHits(g.player2Id) : g.countHits(g.player1Id),
      }
    })
  }

  async getGameDetail(user: { id: string }, gameId: string): Promise<GameDetailStatsDto | null> {
    const game = await this.repo.getGameById(gameId)
    if (!game || ![game.player1Id, game.player2Id].includes(user.id)) return null

    const turns = game.turns

    // Collect attacks by player
    const player1Attacks = []
    const player2Attacks = []
    for (const turn of turns) {
      if (turn.playerId === game.player1Id) {
        player1Attacks.push({ x: turn.attackX, y: turn.attackY, hit: !!turn.isHit })
      } else {
        player2Attacks.push({ x: turn.attackX, y: turn.attackY, hit: !!turn.isHit })
      }
    }

    return {
      game: {
        id: game.id,
        status: game.status,
        started_at: game.startedAt ? game.startedAt.toFormat('dd/MM/yyyy HH:mm') : 'Sin fecha',
        finished_at: game.finishedAt ? game.finishedAt.toFormat('dd/MM/yyyy HH:mm') : null,
        winner_id: game.winnerId,
        winner_name: game.winner?.name ?? null,
      },
      players: {
        player1: {
          id: game.player1.id,
          name: game.player1.name,
          is_me: game.player1.id === user.id,
        },
        player2: {
          id: game.player2.id,
          name: game.player2.name,
          is_me: game.player2.id === user.id,
        },
      },
      boards: {
        player1_board: game.player1InitialBoard ?? [],
        player2_board: game.player2InitialBoard ?? [],
      },
      attacks: {
        player1_attacks: player1Attacks,
        player2_attacks: player2Attacks,
      },
      stats: {
        player1_hits: game.countHits(game.player1Id),
        player2_hits: game.countHits(game.player2Id),
        total_turns: turns.length,
      },
    }
  }
}
