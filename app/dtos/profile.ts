export interface ProfileResponseDto {
  id: string
  name: string
  email: string
  wins: number
  losses: number
  createdAt: string
}

export interface UpdateProfileRequestDto {
  name?: string
  email?: string
  password?: string
}
