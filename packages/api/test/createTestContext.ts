import winston from 'winston'
import { Context } from '../../auth/src/middleware/createContext'
import { userDoc } from '../../auth/test/documents/user'

export const createTestContext = (): Context => ({
  log: winston.createLogger({
    level: process.env.LOGLEVEL?.toLowerCase() ?? 'info',
    defaultMeta: { service: 'auth' }
  }),
  principal: {
    user: userDoc,
  }
})