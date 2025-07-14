import User from '#models/user'
import type { UpdateProfileRequestDto } from '#dtos/profile'

export class ProfileRepository {
  async getById(id: string) {
    return User.find(id)
  }

  async update(user: User, data: UpdateProfileRequestDto) {
    if (data.name) user.name = data.name
    if (data.email) user.email = data.email
    if (data.password) user.password = data.password
    await user.save()
    return user
  }

  async delete(user: User) {
    await user.delete()
  }
}
