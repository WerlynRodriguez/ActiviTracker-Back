import 'dotenv/config'

export const JWT_KEY = process.env.JWT_KEY || 'secret'
export const PORT = process.env.PORT || 3000
export const MONGO_USER = process.env.MONGO_USER || 'admin'
export const MONGO_PASS = process.env.MONGO_PASS || 'admin'