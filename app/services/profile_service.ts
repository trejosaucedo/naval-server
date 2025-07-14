import { ProfileRepository } from '#repositories/profile_repository'
import type { UpdateProfileRequestDto, ProfileResponseDto } from '#dtos/profile'
import User from '#models/user'

export class ProfileService {
  private repo = new ProfileRepository()

  async getProfile(userId: string): Promise<ProfileResponseDto | null> {
    const user = await this.repo.getById(userId)
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      wins: user.wins,
      losses: user.losses,
      createdAt: user.createdAt?.toISO() ?? '',
    }
  }

  async updateProfile(
    userDto: { id: string },
    data: UpdateProfileRequestDto
  ): Promise<ProfileResponseDto> {
    const user = await User.findOrFail(userDto.id)
    const updated = await this.repo.update(user, data)
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      wins: updated.wins,
      losses: updated.losses,
      createdAt: updated.createdAt?.toISO() ?? '',
    }
  }

  async deleteAccount(userDto: { id: string }) {
    const user = await User.findOrFail(userDto.id)
    await this.repo.delete(user)
    return { deleted: true }
  }
}
