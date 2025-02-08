import 'dotenv/config'
console.log(process.env)
export const API_URL = process.env.API_URL ?? 'http://localhost:3000'