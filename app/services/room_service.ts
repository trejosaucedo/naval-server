import { RoomRepository } from '#repositories/room_repository'
import type { CreateRoomRequestDto } from '#dtos/room'
import Room from '#models/room'
import Game from '#models/game'
import { DateTime } from 'luxon'

export class RoomService {
  private repo = new RoomRepository()

  async listAvailable() {
    return this.repo.findWaitingRooms()
  }

  async create(dto: CreateRoomRequestDto, player1Id: string) {
    return this.repo.create({ name: dto.name, player1Id, status: 'waiting' })
  }

  async getById(id: string) {
    return this.repo.findById(id)
  }

  async join(room: Room, player2Id: string) {
    if (room.player2Id) throw new Error('Sala llena')
    room.player2Id = player2Id
    room.status = 'full'
    await this.repo.save(room)
    return room
  }

  async start(room: Room) {
    if (!room.player1Id || !room.player2Id) throw new Error('Faltan jugadores')
    if (room.status !== 'full') throw new Error('No puedes iniciar aún')
    room.status = 'started'
    await this.repo.save(room)
    // Crea el juego
    const newGame = await Game.create({
      roomId: room.id,
      player1Id: room.player1Id,
      player2Id: room.player2Id,
      player1InitialBoard: Game.generateBoard(),
      player2InitialBoard: Game.generateBoard(),
      currentTurn: 1,
      status: 'playing',
      startedAt: DateTime.local(),
    })
    return { room, game: newGame }
  }

  async leave(room: Room, userId: string) {
    if (room.player1Id === userId) {
      await this.repo.delete(room)
      return { deleted: true }
    }
    if (room.player2Id === userId) {
      room.player2Id = null
      room.status = 'waiting'
      await this.repo.save(room)
      return { left: true }
    }
    throw new Error('No tienes permisos')
  }

  async status(room: Room) {
    await room.load('player1')
    await room.load('player2')
    // Busca el game_id si la sala está iniciada
    let gameId = null
    if (room.status === 'started') {
      const game = await Game.query().where('room_id', room.id).first()
      if (game) gameId = game.id
    }
    return {
      status: room.status,
      player1: room.player1 ? { id: room.player1.id, name: room.player1.name } : null,
      player2: room.player2 ? { id: room.player2.id, name: room.player2.name } : null,
      game_id: gameId,
    }
  }
}
