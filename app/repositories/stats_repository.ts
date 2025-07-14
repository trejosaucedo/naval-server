import Game from '#models/game'

export class StatsRepository {
  async getFinishedGames(userId: string) {
    return Game.query()
      .where((q) => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .where('status', 'finished')
      .preload('winner')
      .preload('player1')
      .preload('player2')
      .preload('turns')
  }

  async getWonGames(userId: string) {
    return Game.query()
      .where((q) => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .where('winner_id', userId)
      .where('status', 'finished')
      .preload('player1')
      .preload('player2')
      .orderBy('finished_at', 'desc')
  }

  async getLostGames(userId: string) {
    return Game.query()
      .where((q) => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .whereNot('winner_id', userId)
      .whereNotNull('winner_id')
      .where('status', 'finished')
      .preload('player1')
      .preload('player2')
      .preload('winner')
      .orderBy('finished_at', 'desc')
  }

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
