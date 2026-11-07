import { z } from "zod"

export const LevelSchema = z.enum(["normal", "observe", "warning", "critical"])
export type Level = z.infer<typeof LevelSchema>

export const TierSchema = z.enum(["Private", "Medical Officer", "Mission Control"])
export type Tier = z.infer<typeof TierSchema>

export const RoleSchema = z.enum(["Astronaut", "Medical Officer", "Mission Control"])
export type Role = z.infer<typeof RoleSchema>

export const SourceKindSchema = z.enum(["synthetic", "nasa"])
export type SourceKind = z.infer<typeof SourceKindSchema>

export const MetricKeySchema = z.enum([
  "restHR",
  "hrv",
  "spo2",
  "hrr",
  "sleep",
  "temp",
  "stress",
  "mood",
  "vision",
  "reaction",
  "balance",
  "co2",
])
export type MetricKey = z.infer<typeof MetricKeySchema>

export const AstronautSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  role: z.string(),
  mission: z.string(),
  crew: z.string(),
})
export type Astronaut = z.infer<typeof AstronautSchema>

export const BaselineSchema = z.object({
  metric: MetricKeySchema,
  mean: z.number(),
  sd: z.number(),
  unit: z.string(),
  label: z.string(),
  phase: z.enum(["Calibrating", "Adapting", "Stable"]),
})
export type Baseline = z.infer<typeof BaselineSchema>

export const VitalSampleSchema = z.object({
  minute: z.number(),
  hr: z.number(),
  expectedHr: z.number(),
  spo2: z.number(),
})
export type VitalSample = z.infer<typeof VitalSampleSchema>

export const SourceSchema = z.object({
  kind: SourceKindSchema,
  label: z.string(),
})
export type Source = z.infer<typeof SourceSchema>

export const AlertSchema = z.object({
  id: z.string(),
  module: z.string(),
  level: LevelSchema,
  title: z.string(),
  why: z.array(z.string()),
  confidence: z.number(),
  sources: z.array(SourceSchema),
  grouped: z.array(z.string()),
  chain: z.array(z.array(z.string())),
  actions: z.array(z.string()),
  canWaitMinutes: z.number(),
  route: z.string(),
})
export type Alert = z.infer<typeof AlertSchema>

export const CheckSchema = z.object({
  id: z.string(),
  type: z.enum(["vision", "cognitive", "balance", "sample"]),
  due: z.number(),
  done: z.boolean(),
  result: z.string().nullable(),
  baselineDelta: z.number().nullable(),
  unit: z.string(),
})
export type Check = z.infer<typeof CheckSchema>

export const ExerciseSessionSchema = z.object({
  day: z.number(),
  device: z.enum(["ARED", "T2 treadmill", "CEVIS cycle"]),
  planned: z.number(),
  delivered: z.number(),
  intensity: z.number(),
  machineStatus: z.enum(["ok", "degraded", "down"]),
})
export type ExerciseSession = z.infer<typeof ExerciseSessionSchema>

export const RadiationLedgerSchema = z.object({
  day: z.number(),
  doseRate: z.number(),
  cumulative: z.number(),
  career: z.number(),
})
export type RadiationLedger = z.infer<typeof RadiationLedgerSchema>

export const SolarEventSchema = z.object({
  id: z.string(),
  day: z.number(),
  kind: z.string(),
  source: z.string(),
  note: z.string(),
})
export type SolarEvent = z.infer<typeof SolarEventSchema>

export const EnvReadingSchema = z.object({
  co2: z.number(),
  o2: z.number(),
  pressure: z.number(),
  temp: z.number(),
  humidity: z.number(),
  voc: z.number(),
})
export type EnvReading = z.infer<typeof EnvReadingSchema>

export const MoodEntrySchema = z.object({
  day: z.number(),
  mood: z.number(),
  stress: z.number(),
  social: z.number(),
  sleepStart: z.number(),
  activeMin: z.number(),
})
export type MoodEntry = z.infer<typeof MoodEntrySchema>

export const TriageItemSchema = z.object({
  alertId: z.string(),
  title: z.string(),
  level: LevelSchema,
  lane: z.enum(["act", "monitor", "earth"]),
  canWaitMinutes: z.number(),
  reason: z.string(),
})
export type TriageItem = z.infer<typeof TriageItemSchema>

export const SBARReportSchema = z.object({
  situation: z.string(),
  background: z.string(),
  assessment: z.string(),
  recommendation: z.string(),
  generatedDay: z.number(),
  delayMin: z.number(),
})
export type SBARReport = z.infer<typeof SBARReportSchema>

export const PrivacyTierSchema = z.object({
  category: z.string(),
  tier: TierSchema,
  note: z.string(),
})
export type PrivacyTier = z.infer<typeof PrivacyTierSchema>

export const AuditLogEntrySchema = z.object({
  id: z.number(),
  ts: z.string(),
  actor: RoleSchema,
  action: z.string(),
  hash: z.string(),
  prevHash: z.string(),
})
export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>

export const ValidationRowSchema = z.object({
  method: z.string(),
  detectionDays: z.number(),
  falseAlarmsPerCrewMonth: z.number(),
  alertsPer100h: z.number(),
  grouped: z.boolean(),
})
export type ValidationRow = z.infer<typeof ValidationRowSchema>

export const ValidationRunSchema = z.object({
  scenario: z.string(),
  crews: z.number(),
  crewSize: z.number(),
  rows: z.array(ValidationRowSchema),
})
export type ValidationRun = z.infer<typeof ValidationRunSchema>

export const OutageSchema = z.object({
  id: z.number(),
  machine: z.string(),
  day: z.number(),
  days: z.number(),
})
export type Outage = z.infer<typeof OutageSchema>

export const FlagsSchema = z.object({
  feelFine: z.boolean(),
  co2Event: z.boolean(),
  solarEvent: z.boolean(),
  sensorMode: z.enum(["none", "dropout", "real"]),
})
export type Flags = z.infer<typeof FlagsSchema>

export const CoachMessageSchema = z.object({
  id: z.string(),
  from: z.enum(["you", "coach"]),
  text: z.string(),
  ts: z.string(),
})
export type CoachMessage = z.infer<typeof CoachMessageSchema>

export const HazardLinkSchema = z.object({
  from: z.string(),
  to: z.string(),
  w: z.number(),
  signals: z.array(z.string()),
})
export type HazardLink = z.infer<typeof HazardLinkSchema>

export const HazardSchema = z.object({
  id: z.string(),
  label: z.string(),
})
export type Hazard = z.infer<typeof HazardSchema>

export const OutcomeSchema = z.object({
  id: z.string(),
  label: z.string(),
})
export type Outcome = z.infer<typeof OutcomeSchema>

export const EvaluationSchema = z.object({
  day: z.number(),
  sm: z.record(MetricKeySchema, z.number()),
  z: z.record(MetricKeySchema, z.number()),
  env: EnvReadingSchema,
  live: z.array(VitalSampleSchema),
  nowS: VitalSampleSchema,
  gapNow: z.number(),
  strain: z.boolean(),
  bone: z.object({
    deliveredFrac: z.number(),
    risk: z.number(),
    baseRisk: z.number(),
    projectedRisk: z.number(),
    outageActive: z.boolean(),
    devices: z.array(
      z.object({
        name: z.string(),
        planned: z.number(),
        logged: z.number(),
        delivered: z.number(),
      }),
    ),
  }),
  dose: RadiationLedgerSchema,
  doseRate: z.number(),
  cusum: z.number(),
  rawSignals: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      on: z.boolean(),
    }),
  ),
  alerts: z.array(AlertSchema),
  fault: z
    .object({
      faultPct: z.number(),
      realPct: z.number(),
      abrupt: z.number(),
      corro: z.number(),
    })
    .nullable(),
  twin: z.array(
    z.object({
      hour: z.number(),
      expected: z.number(),
      actual: z.number().nullable(),
    }),
  ),
  signalsA: z.array(z.object({ id: z.string(), label: z.string(), on: z.boolean() })),
  signalsB: z.array(z.object({ id: z.string(), label: z.string(), on: z.boolean() })),
  nextCheck: CheckSchema.nullable(),
  adherence: z.number(),
  overall: LevelSchema,
  career: z.object({ total: z.number(), pct: z.number() }),
  mood: MoodEntrySchema,
})
export type Evaluation = z.infer<typeof EvaluationSchema>