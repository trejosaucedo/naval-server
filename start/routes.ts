import router from '@adonisjs/core/services/router'
const AuthController = () => import('#controllers/auth_controller')
const RoomController = () => import('#controllers/room_controller')
const GameController = () => import('#controllers/game_controller')
const StatsController = () => import('#controllers/stats_controller')
const ProfileController = () => import('#controllers/profile_controller')
import { middleware } from './kernel.js'

// Rutas públicas de autenticación
router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])

// Rutas protegidas de autenticación y personas
router
  .group(() => {
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/rooms', [RoomController, 'index'])
    router.post('/rooms', [RoomController, 'store'])
    router.get('/rooms/:id', [RoomController, 'show'])
    router.post('/rooms/:id/join', [RoomController, 'join'])
    router.post('/rooms/:id/start', [RoomController, 'start'])
    router.post('/rooms/:id/leave', [RoomController, 'leave'])
    router.get('/rooms/:id/status', [RoomController, 'status'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/games/:id/state', [GameController, 'getState'])
    router.post('/games/:id/attack', [GameController, 'attack'])
    router.get('/games/history', [GameController, 'history'])
    router.get('/games/:id', [GameController, 'details'])
    router.post('/games/:id/abandon', [GameController, 'abandon'])
  })
  .use(middleware.auth())

router
  .group(() => {
    router.get('/stats', [StatsController, 'index'])
    router.get('/stats/won', [StatsController, 'wonGames'])
    router.get('/stats/lost', [StatsController, 'lostGames'])
    router.get('/stats/game/:id', [StatsController, 'gameDetail'])
  }).use(middleware.auth())

router
  .group(() => {
    router.get('/profile', [ProfileController, 'show'])
    router.put('/profile', [ProfileController, 'update'])
    router.delete('/profile', [ProfileController, 'destroy'])
  })
  .use(middleware.auth())
