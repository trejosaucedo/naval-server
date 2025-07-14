import Game from '#models/game'

export class GameRepository {
  async findById(id: string) {
    return Game.query()
      .where('id', id)
      .preload('player1')
      .preload('player2')
      .preload('turns')
      .first()
  }

  async save(game: Game) {
    return game.save()
  }

  async getHistoryByUserId(userId: string) {
    return Game.query()
      .where(q => {
        q.where('player1_id', userId).orWhere('player2_id', userId)
      })
      .where('status', 'finished')
      .preload('player1')
      .preload('player2')
      .preload('winner')
      .orderBy('finished_at', 'desc')
  }
}
