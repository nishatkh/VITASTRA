import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { hydrate } from "./store/useApp"

// Unregister any cached service worker to prevent page reloads on section switches
if (typeof navigator !== "undefined" && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()
    })
  })
}

hydrate().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
