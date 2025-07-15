import type { HttpContext } from '@adonisjs/core/http'
import { ResponseHelper } from '#utils/response_helper'
import { GameService } from '#services/game_service'
import { attackValidator } from '#validators/game'

export default class GameController {
  private service = new GameService()

  async getState({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const game = await this.service.getById(params.id)
    if (!game) return ResponseHelper.error(response, 'Juego no encontrado', 404)
    const result = await this.service.getState(game, user.id)
    if (!result) return ResponseHelper.error(response, 'No tienes acceso a este juego', 403)
    return ResponseHelper.success(response, 'Estado del juego', result)
  }

  async attack({ params, user, request, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const game = await this.service.getById(params.id)
    if (!game) return ResponseHelper.error(response, 'Juego no encontrado', 404)
    const payload = await request.validateUsing(attackValidator)
    try {
      const result = await this.service.attack(game, user.id, payload.x, payload.y)
      return ResponseHelper.success(response, 'Ataque procesado', result)
    } catch (err) {
      return ResponseHelper.error(response, err.message, 400)
    }
  }

  async history({ user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const history = await this.service.getHistory(user.id)
    return ResponseHelper.success(response, 'Historial', history)
  }

  async details({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const game = await this.service.getById(params.id)
    if (!game) return ResponseHelper.error(response, 'Juego no encontrado', 404)
    const details = await this.service.getDetails(game, user.id)
    if (!details) return ResponseHelper.error(response, 'No tienes acceso a este juego', 403)
    return ResponseHelper.success(response, 'Detalle del juego', details)
  }

  async abandon({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const game = await this.service.getById(params.id)
    if (!game) return ResponseHelper.error(response, 'Juego no encontrado', 404)
    try {
      const result = await this.service.abandon(game, user.id)
      return ResponseHelper.success(response, 'Partida abandonada', result)
    } catch (err) {
      return ResponseHelper.error(response, err.message, 400)
    }
  }

  
}
