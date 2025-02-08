'use client'
import 'dotenv/config'
console.log(process.env)
import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()

  router.push("/home");
 
  return (
    <p>Redirecionando para o daashboard...</p>
  )
}