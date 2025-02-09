'use client'

import { useRouter } from 'next/navigation'
 
export default function Page() {
  const router = useRouter()

  router.push("/home");
 
  return (
    <p>Redirecionando para o dashboard...</p>
  )
}