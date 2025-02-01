import { useEffect } from 'react'
import { useRouter } from 'next/router'
 
export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
 
  useEffect(() => {
    const handleRouteChangeError = (err, url) => {
      if (err.cancelled) {
        console.log(`Route to ${url} was cancelled!`)
      }
    }
 
    router.events.on('routeChangeError', handleRouteChangeError)
 
    // If the component is unmounted, unsubscribe
    // from the event with the `off` method:
    return () => {
      router.events.off('routeChangeError', handleRouteChangeError)
    }
  }, [router])
 
  return <Component {...pageProps} />
}