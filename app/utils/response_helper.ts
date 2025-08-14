import type { HttpContext } from '@adonisjs/core/http'

interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

export class ResponseHelper {
  static success<T = unknown>(
    response: HttpContext['response'],
    message: string,
    data?: T,
    status = 200
  ) {
    const resp: ApiResponse<T> = { success: true, message }
    if (typeof data !== 'undefined') resp.data = data
    return response.status(status).json(resp)
  }

  static error<T = unknown>(
    response: HttpContext['response'],
    message: string,
    status = 400,
    data?: T
  ) {
    const resp: ApiResponse<T> = { success: false, message }
    if (typeof data !== 'undefined') resp.data = data
    return response.status(status).json(resp)
  }
}
