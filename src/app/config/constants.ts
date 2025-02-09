import 'dotenv/config'
console.log(process.env)
export const API_URL = process.env.API_URL ?? 'http://restaurante-acme-video-svc.fiap.svc.cluster.local'