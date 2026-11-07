export type Level = "normal" | "observe" | "warning" | "critical"
export type Tier = "Private" | "Medical Officer" | "Mission Control"
export type Role = "Astronaut" | "Medical Officer" | "Mission Control"
export type SourceKind = "synthetic" | "nasa"
export type MetricKey = "restHR" | "hrv" | "spo2" | "hrr" | "sleep" | "temp" | "stress" | "mood" | "vision" | "reaction" | "balance" | "co2"

export interface Astronaut {
  id: string
  name: string
  initials: string
  role: string
  mission: string
  crew: string
}
export interface Baseline {
  metric: MetricKey
  mean: number
  sd: number
  unit: string
  label: string
  phase: "Calibrating" | "Adapting" | "Stable"
}
export interface VitalSample {
  minute: number
  hr: number
  expectedHr: number
  spo2: number
}
export interface Source {
  kind: SourceKind
  label: string
}
export interface Alert {
  id: string
  module: string
  level: Level
  title: string
  why: string[]
  confidence: number
  sources: Source[]
  grouped: string[]
  chain: string[][]
  actions: string[]
  canWaitMinutes: number
  route: string
}
export interface Check {
  id: string
  type: "vision" | "cognitive" | "balance" | "sample"
  due: number
  done: boolean
  result: string | null
  baselineDelta: number | null
  unit: string
}
export interface ExerciseSession {
  day: number
  device: "ARED" | "T2 treadmill" | "CEVIS cycle"
  planned: number
  delivered: number
  intensity: number
  machineStatus: "ok" | "degraded" | "down"
}
export interface RadiationLedger {
  day: number
  doseRate: number
  cumulative: number
  career: number
}
export interface SolarEvent {
  id: string
  day: number
  kind: string
  source: string
  note: string
}
export interface EnvReading {
  co2: number
  o2: number
  pressure: number
  temp: number
  humidity: number
  voc: number
}
export interface MoodEntry {
  day: number
  mood: number
  stress: number
  social: number
  sleepStart: number
  activeMin: number
}
export interface TriageItem {
  alertId: string
  title: string
  level: Level
  lane: "act" | "monitor" | "earth"
  canWaitMinutes: number
  reason: string
}
export interface SBARReport {
  situation: string
  background: string
  assessment: string
  recommendation: string
  generatedDay: number
  delayMin: number
}
export interface PrivacyTier {
  category: string
  tier: Tier
  note: string
}
export interface AuditLogEntry {
  id: number
  ts: string
  actor: Role
  action: string
  hash: string
  prevHash: string
}
export interface ValidationRow {
  method: string
  detectionDays: number
  falseAlarmsPerCrewMonth: number
  alertsPer100h: number
  grouped: boolean
}
export interface ValidationRun {
  scenario: string
  crews: number
  crewSize: number
  rows: ValidationRow[]
}
export interface Outage {
  id: number
  machine: string
  day: number
  days: number
}
export interface Flags {
  feelFine: boolean
  co2Event: boolean
  solarEvent: boolean
  sensorMode: "none" | "dropout" | "real"
}
