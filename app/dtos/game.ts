export interface AttackRequestDto {
  x: number
  y: number
}

export interface GameStateResponseDto {
  game_id: string
  status: string
  current_turn: number
  is_my_turn: boolean
  my_board: number[][]
  opponent_board: number[][]
  my_attacks: { x: number; y: number; hit: boolean }[]
  opponent_attacks: { x: number; y: number; hit: boolean }[]
  player1: { id: string; name: string }
  player2: { id: string; name: string }
  winner_id: string | null
  my_hits: number
  opponent_hits: number
}



export interface GameHistoryItemDto {
  id: string
  opponent: string
  won: boolean
  finished_at: string
  my_hits: number
  opponent_hits: number
}

export interface AttackRequestDto {
  x: number
  y: number
}

export interface GameStateResponseDto {
  game_id: string
  status: string
  current_turn: number
  is_my_turn: boolean
  my_board: number[][]
  opponent_board: number[][]
  my_attacks: { x: number; y: number; hit: boolean }[]
  opponent_attacks: { x: number; y: number; hit: boolean }[]
  player1: { id: string; name: string }
  player2: { id: string; name: string }
  winner_id: string | null
  my_hits: number
  opponent_hits: number
}



export interface GameHistoryItemDto {
  id: string
  opponent: string
  won: boolean
  finished_at: string
  my_hits: number
  opponent_hits: number
}

export interface GameDetailsResponseDto {
  game: {
    id: string
    status: string
    started_at: string
    finished_at: string | null
    winner_id: string | null
  }
  players: {
    player1: string
    player2: string
  }
  boards: {
    my_board: number[][]
    opponent_board: number[][]
  }
  attacks: {
    my_attacks: { x: number; y: number; hit: boolean }[]
    opponent_attacks: { x: number; y: number; hit: boolean }[]
  }
  turns: any[]
}
