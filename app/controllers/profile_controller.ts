import type { HttpContext } from '@adonisjs/core/http'
import { ProfileService } from '#services/profile_service'
import { ResponseHelper } from '#utils/response_helper'
import { updateProfileValidator } from '#validators/profile'

export default class ProfileController {
  private service = new ProfileService()

  async show({ user, response }: HttpContext) {
    const profile = await this.service.getProfile(user!.id)
    return ResponseHelper.success(response, 'Perfil de usuario', profile)
  }

  async update({ user, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateProfileValidator)
    const updated = await this.service.updateProfile(user!, payload)
    return ResponseHelper.success(response, 'Perfil actualizado', updated)
  }

  async destroy({ user, response }: HttpContext) {
    await this.service.deleteAccount(user!)
    return ResponseHelper.success(response, 'Cuenta eliminada')
  }
}
