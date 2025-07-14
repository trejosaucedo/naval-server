import type { HttpContext } from '@adonisjs/core/http'
import { RoomService } from '#services/room_service'
import { createRoomValidator } from '#validators/room'
import { ResponseHelper } from '#utils/response_helper'
import Room from '#models/room'

export default class RoomController {
  private service = new RoomService()

  async index({ response }: HttpContext) {
    const rooms = await this.service.listAvailable()
    return ResponseHelper.success(response, 'Salas encontradas', rooms)
  }

  async store({ request, response, user }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    try {
      const payload = await request.validateUsing(createRoomValidator)
      const room = await this.service.create(payload, user.id)
      return ResponseHelper.success(response, 'Sala creada', room, 201)
    } catch (error) {
      return ResponseHelper.error(response, 'Error al crear sala', 400, error)
    }
  }

  async show({ params, response }: HttpContext) {
    const room = await this.service.getById(params.id)
    if (!room) return ResponseHelper.error(response, 'Sala no encontrada', 404)
    return ResponseHelper.success(response, 'Sala encontrada', room)
  }

  async join({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const room = await Room.find(params.id)
    if (!room) return ResponseHelper.error(response, 'Sala no encontrada', 404)
    try {
      await this.service.join(room, user.id)
      return ResponseHelper.success(response, 'Te uniste a la sala', room)
    } catch (error) {
      return ResponseHelper.error(response, error.message, 400)
    }
  }

  async start({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const room = await Room.find(params.id)
    if (!room) return ResponseHelper.error(response, 'Sala no encontrada', 404)
    if (room.player1Id !== user.id)
      return ResponseHelper.error(response, 'Solo el anfitrión puede iniciar', 403)
    try {
      const result = await this.service.start(room)
      return ResponseHelper.success(response, 'Partida iniciada', result)
    } catch (error) {
      return ResponseHelper.error(response, error.message, 400)
    }
  }

  async leave({ params, user, response }: HttpContext) {
    if (!user) return ResponseHelper.error(response, 'No autenticado', 401)
    const room = await Room.find(params.id)
    if (!room) return ResponseHelper.error(response, 'Sala no encontrada', 404)
    try {
      const result = await this.service.leave(room, user.id)
      return ResponseHelper.success(response, 'Salida exitosa', result)
    } catch (error) {
      return ResponseHelper.error(response, error.message, 400)
    }
  }

  async status({ params, response }: HttpContext) {
    const room = await Room.find(params.id)
    if (!room) return ResponseHelper.error(response, 'Sala no encontrada', 404)
    const status = await this.service.status(room)
    return ResponseHelper.success(response, 'Estado de sala', status)
  }
}
