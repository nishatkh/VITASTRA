import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Outlet } from "react-router"
import { MotionConfig } from "framer-motion"
import { AppFrame } from "../components/AppFrame"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <Outlet />
      </MotionConfig>
    </QueryClientProvider>
  )
}

export function AppLayout() {
  return <AppFrame><Outlet /></AppFrame>
}