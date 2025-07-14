export interface CreateRoomRequestDto {
  name: string
}

export interface RoomResponseDto {
  id: string
  name: string
  player1: { id: string, name: string }
  player2: { id: string, name: string } | null
  status: 'waiting' | 'full' | 'started' | 'finished'
}

export interface RoomStatusResponseDto {
  status: string
  player1: { id: string, name: string } | null
  player2: { id: string, name: string } | null
}
