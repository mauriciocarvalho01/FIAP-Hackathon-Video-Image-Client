import 'dotenv/config'
console.log(process.env)
export const API_URL = process.env.API_URL ?? 'http://a5d905fae06924cbfae9f21f9712b77f-765655578.us-east-1.elb.amazonaws.com'