import Game from '#models/game'

export class StatsRepository {
  // Todas las partidas terminadas donde participó el usuario
  async getFinishedGames(userId: string) {
    return Game.query()
      .where(q => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .where('status', 'finished')
      .preload('winner')
      .preload('player1')
      .preload('player2')
      .preload('turns')
      .orderBy('finished_at', 'desc')
  }

  // Partidas ganadas (donde el usuario fue el ganador)
  async getWonGames(userId: string) {
    return Game.query()
      .where(q => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .where('winner_id', userId)
      .where('status', 'finished')
      .preload('winner')
      .preload('player1')
      .preload('player2')
      .preload('turns')
      .orderBy('finished_at', 'desc')
  }

  // Partidas perdidas (donde el usuario NO fue el ganador)
  async getLostGames(userId: string) {
    return Game.query()
      .where(q => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .whereNot('winner_id', userId)
      .whereNotNull('winner_id')
      .where('status', 'finished')
      .preload('winner')
      .preload('player1')
      .preload('player2')
      .preload('turns')
      .orderBy('finished_at', 'desc')
  }

  // Detalle de una partida específica
  async getGameById(gameId: string) {
    return Game.query()
      .where('id', gameId)
      .preload('player1')
      .preload('player2')
      .preload('winner')
      .preload('turns', (builder) => builder.preload('player'))
      .first()
  }
}
