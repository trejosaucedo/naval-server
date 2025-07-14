import Room from '#models/room'

export class RoomRepository {
  async findWaitingRooms() {
    return Room.query().where('status', 'waiting').preload('player1').orderBy('created_at', 'desc')
  }

  async findById(id: string) {
    return Room.query()
      .where('id', id)
      .preload('player1')
      .preload('player2')
      .preload('game')
      .first()
  }

  async create(data: Partial<Room>) {
    return Room.create(data)
  }

  async save(room: Room) {
    return room.save()
  }

  async delete(room: Room) {
    return room.delete()
  }
}
