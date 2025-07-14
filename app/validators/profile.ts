import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(2).maxLength(50).optional(),
    email: vine.string().email().optional(),
    password: vine.string().minLength(6).optional(),
  })
)
