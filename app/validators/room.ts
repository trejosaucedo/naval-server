import vine from '@vinejs/vine'

export const createRoomValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(32),
  })
)
