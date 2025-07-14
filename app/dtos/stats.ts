export interface StatsSummaryDto {
  wins: number
  losses: number
  totalGames: number
  winRate: number
}

export interface StatsGameItemDto {
  id: string
  opponent_name: string
  winner_name?: string
  finished_at: string
  my_hits: number
  opponent_hits: number
}

export interface GameDetailStatsDto {
  game: {
    id: string
    status: string
    started_at: string
    finished_at: string | null
    winner_id: string | null
    winner_name: string | null
  }
  players: {
    player1: { id: string; name: string; is_me: boolean }
    player2: { id: string; name: string; is_me: boolean }
  }
  boards: {
    player1_board: number[][]
    player2_board: number[][]
  }
  attacks: {
    player1_attacks: { x: number; y: number; hit: boolean }[]
    player2_attacks: { x: number; y: number; hit: boolean }[]
  }
  stats: {
    player1_hits: number
    player2_hits: number
    total_turns: number
  }
}
