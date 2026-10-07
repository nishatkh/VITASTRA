import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet } from "react-router"
import { MotionConfig } from "framer-motion"
import { AppFrame } from "../components/AppFrame"
import AmourSunrisePreloader from "../components/ui/amour-sunrise-preloader"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function Root() {
  // Show the preloader on every fresh page load
  const [done, setDone] = React.useState(false)

  const handleComplete = React.useCallback(() => {
    setDone(true)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        {done ? (
          <Outlet />
        ) : (
          <AmourSunrisePreloader onComplete={handleComplete} height="100dvh">
            <Outlet />
          </AmourSunrisePreloader>
        )}
      </MotionConfig>
    </QueryClientProvider>
  )
}

export function AppLayout() {
  return <AppFrame><Outlet /></AppFrame>
}