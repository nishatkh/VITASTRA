import { createBrowserRouter, Navigate } from "react-router"
import { Root, AppLayout } from "./screens/Root"
import Home from "./screens/Home"
import More from "./screens/More"
import Sources from "./screens/Sources"
import Timeline from "./screens/Timeline"
import Privacy from "./screens/Privacy"
import Baseline from "./screens/Baseline"
import Alerts from "./screens/Alerts"
import Settings from "./screens/Settings"
import Heart from "./modules/heart"
import Bone from "./modules/bone"
import Immune from "./modules/immune"
import Vision from "./modules/vision"
import Radiation from "./modules/radiation"
import Mood from "./modules/mood"
import Environment from "./modules/environment"
import Cognitive from "./modules/cognitive"
import CognitiveTest from "./modules/cognitive/Test"
import Scheduler from "./modules/scheduler"
import Coach from "./modules/coach"
import Twin from "./modules/twin"
import Sensor from "./modules/sensor"
import Contested from "./modules/contested"
import Hazards from "./modules/hazards"
import Triage from "./modules/triage"
import Validation from "./modules/validation"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      {
        Component: AppLayout,
        children: [
          { index: true, Component: Home },
          { path: "body", Component: Heart },
          { path: "bone", Component: Bone },
          { path: "immune", Component: Immune },
          { path: "vision", Component: Vision },
          { path: "radiation", Component: Radiation },
          { path: "mood", Component: Mood },
          { path: "env", Component: Environment },
          { path: "cognitive", Component: Cognitive },
          { path: "cognitive/test", Component: CognitiveTest },
          { path: "checks", Component: Scheduler },
          { path: "coach", Component: Coach },
          { path: "twin", Component: Twin },
          { path: "sensor", Component: Sensor },
          { path: "contested", Component: Contested },
          { path: "baseline", Component: Baseline },
          { path: "alerts", Component: Alerts },
          { path: "timeline", Component: Timeline },
          { path: "privacy", Component: Privacy },
          { path: "sources", Component: Sources },
          { path: "settings", Component: Settings },
          { path: "more", Component: More },
          { path: "mc", element: <Navigate to="/mc/hazards" replace /> },
          { path: "mc/hazards", Component: Hazards },
          { path: "mc/triage", Component: Triage },
          { path: "mc/handoff", Component: Triage },
          { path: "mc/validation", Component: Validation },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
])
