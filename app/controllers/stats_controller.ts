// app/controllers/stats_controller.ts

import type { HttpContext } from '@adonisjs/core/http'
import { StatsService } from '#services/stats_service'
import { ResponseHelper } from '#utils/response_helper'

export default class StatsController {
  private service = new StatsService()

  async index({ user, response }: HttpContext) {
    const summary = await this.service.getSummary(user!)
    return ResponseHelper.success(response, 'Estadísticas generales', summary)
  }

  async wonGames({ user, response }: HttpContext) {
    const games = await this.service.getWonGames(user!)
    return ResponseHelper.success(response, 'Partidas ganadas', games)
  }

  async lostGames({ user, response }: HttpContext) {
    const games = await this.service.getLostGames(user!)
    return ResponseHelper.success(response, 'Partidas perdidas', games)
  }

  async gameDetail({ user, params, response }: HttpContext) {
    const detail = await this.service.getGameDetail(user!, params.id)
    if (!detail) return ResponseHelper.error(response, 'No tienes acceso', 403)
    return ResponseHelper.success(response, 'Detalle de partida', detail)
  }
}
