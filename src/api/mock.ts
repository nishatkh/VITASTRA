/**
 * ASTRA-X Demo Mock Layer
 * One astronaut: Dr. Elena Vasquez, Mission Day 42 of ISS Expedition 72
 * All API endpoints resolved in-memory — no backend required.
 */

import type {
  Astronaut,
  Baseline,
  VitalSample,
  Alert,
  Check,
  ExerciseSession,
  RadiationLedger,
  SolarEvent,
  EnvReading,
  MoodEntry,
  TriageItem,
  SBARReport,
  PrivacyTier,
  AuditLogEntry,
  ValidationRun,
  Outage,
  CoachMessage,
  Hazard,
  Outcome,
  HazardLink,
  Evaluation,
} from "./schemas"

// ─── Astronaut ───────────────────────────────────────────────────────────────

export const DEMO_ASTRONAUT: Astronaut = {
  id: "elena-vasquez-001",
  name: "Dr. Elena Vasquez",
  initials: "EV",
  role: "Mission Specialist",
  mission: "ISS Expedition 72",
  crew: "Alpha-3",
}

// ─── Baselines ────────────────────────────────────────────────────────────────

export const DEMO_BASELINES: Baseline[] = [
  { metric: "restHR",   mean: 58,   sd: 4.2,  unit: "bpm", label: "Resting HR",    phase: "Stable" },
  { metric: "hrv",      mean: 52,   sd: 6.1,  unit: "ms",  label: "HRV (rMSSD)",   phase: "Stable" },
  { metric: "spo2",     mean: 97.8, sd: 0.6,  unit: "%",   label: "SpO2",           phase: "Stable" },
  { metric: "hrr",      mean: 38,   sd: 5.0,  unit: "bpm", label: "HR Recovery",   phase: "Adapting" },
  { metric: "sleep",    mean: 7.1,  sd: 0.8,  unit: "h",   label: "Sleep",          phase: "Stable" },
  { metric: "temp",     mean: 36.7, sd: 0.3,  unit: "C",   label: "Core temp",     phase: "Stable" },
  { metric: "stress",   mean: 28,   sd: 7.0,  unit: "",    label: "Stress index",  phase: "Adapting" },
  { metric: "mood",     mean: 72,   sd: 9.0,  unit: "",    label: "Mood score",    phase: "Stable" },
  { metric: "vision",   mean: 1.0,  sd: 0.05, unit: "",    label: "Visual acuity", phase: "Calibrating" },
  { metric: "reaction", mean: 245,  sd: 18,   unit: "ms",  label: "Reaction time", phase: "Stable" },
  { metric: "balance",  mean: 94,   sd: 3.2,  unit: "%",   label: "Balance score", phase: "Adapting" },
  { metric: "co2",      mean: 3200, sd: 180,  unit: "ppm", label: "Exhaled CO2",   phase: "Stable" },
]

// ─── Vital samples — 60 minutes of live HR data ───────────────────────────────

function genVitals(): VitalSample[] {
  const samples: VitalSample[] = []
  let hr = 62
  for (let i = 0; i < 60; i++) {
    hr += (Math.random() - 0.48) * 3
    hr = Math.max(54, Math.min(82, hr))
    samples.push({
      minute: i,
      hr: Math.round(hr * 10) / 10,
      expectedHr: 61,
      spo2: 97.5 + Math.random() * 0.8,
    })
  }
  return samples
}

export const DEMO_VITALS: VitalSample[] = genVitals()

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const DEMO_ALERTS: Alert[] = [
  {
    id: "alert-001",
    module: "CardioWatch",
    level: "observe",
    title: "HRV trending downward - early fatigue signal",
    why: [
      "HRV (rMSSD) dropped 14% over last 3 days vs personal baseline.",
      "Sleep efficiency fell below 85% on days 40 and 41.",
      "Stress index 1.4 SD above baseline since EVA prep began.",
    ],
    confidence: 0.78,
    sources: [
      { kind: "synthetic", label: "Wearable stream" },
      { kind: "nasa",      label: "NASA HRV reference" },
    ],
    grouped: ["HRV decline", "Sleep fragmentation", "Elevated stress"],
    chain: [
      ["EVA suit prep", "Disrupted sleep schedule", "Elevated cortisol"],
      ["HRV drop", "SpO2 micro-dips during sleep"],
    ],
    actions: [
      "Extend rest period by 30 min for the next 2 nights.",
      "Defer non-critical tasks tomorrow morning.",
      "Monitor next HRV reading before EVA go/no-go.",
    ],
    canWaitMinutes: 720,
    route: "/alerts/alert-001",
  },
  {
    id: "alert-002",
    module: "EnvMonitor",
    level: "observe",
    title: "Cabin CO2 nudging upper safe band",
    why: [
      "CO2 averaged 4350 ppm over the past 4 hours (normal <= 4200 ppm).",
      "Node 2 scrubber scheduled for canister swap tomorrow.",
      "Correlated with mild headache report logged at 14:22 UTC.",
    ],
    confidence: 0.91,
    sources: [
      { kind: "synthetic", label: "Environmental sensor grid" },
      { kind: "nasa",      label: "NASA ECLSS telemetry" },
    ],
    grouped: ["Elevated CO2", "Headache symptom"],
    chain: [
      ["Scrubber approaching end-of-life", "CO2 rise"],
      ["CO2 rise", "Vasodilation", "Headache"],
    ],
    actions: [
      "Advance scrubber canister swap to today if crew schedule allows.",
      "Increase cabin ventilation flow rate by 10%.",
      "Check O2 partial pressure - ensure it remains >= 19.5 kPa.",
    ],
    canWaitMinutes: 240,
    route: "/alerts/alert-002",
  },
]

// ─── Checks ───────────────────────────────────────────────────────────────────

export const DEMO_CHECKS: Check[] = [
  { id: "chk-001", type: "vision",    due: 45, done: false, result: null,   baselineDelta: null, unit: "logMAR" },
  { id: "chk-002", type: "cognitive", due: 48, done: false, result: null,   baselineDelta: null, unit: "ms" },
  { id: "chk-003", type: "balance",   due: 42, done: true,  result: "93.2", baselineDelta: -0.8, unit: "%" },
  { id: "chk-004", type: "sample",    due: 50, done: false, result: null,   baselineDelta: null, unit: "—" },
]

// ─── Exercise ─────────────────────────────────────────────────────────────────

export const DEMO_EXERCISE: ExerciseSession[] = Array.from({ length: 7 }, (_, i) => ({
  day: 35 + i,
  device: (["ARED", "T2 treadmill", "CEVIS cycle"] as const)[i % 3],
  planned: 90,
  delivered: [88, 91, 85, 90, 78, 92, 90][i],
  intensity: [0.72, 0.80, 0.65, 0.75, 0.60, 0.82, 0.77][i],
  machineStatus: (i === 4 ? "degraded" : "ok") as "ok" | "degraded" | "down",
}))

export const DEMO_OUTAGES: Outage[] = [
  { id: 1, machine: "T2 treadmill", day: 39, days: 1 },
]

// ─── Radiation ────────────────────────────────────────────────────────────────

export const DEMO_RADIATION: RadiationLedger[] = Array.from({ length: 42 }, (_, i) => ({
  day: i,
  doseRate: 0.48 + Math.sin(i * 0.3) * 0.08 + Math.random() * 0.04,
  cumulative: +(20 + i * 0.49).toFixed(2),
  career: +(80 + i * 0.49).toFixed(2),
}))

export const DEMO_SOLAR_EVENTS: SolarEvent[] = [
  { id: "sol-001", day: 17, kind: "M-class flare", source: "NOAA GOES-18", note: "Proton flux elevated for 6 h; crew sheltered in Zvezda." },
  { id: "sol-002", day: 38, kind: "C-class flare", source: "NOAA GOES-18", note: "Minor event; no shelter action required." },
]

export const DEMO_CAREER_DOSE = { total: 100.6, pct: 100.6 / 600 }

// ─── Environment ──────────────────────────────────────────────────────────────

export const DEMO_ENV_READING: EnvReading = {
  co2: 4350, o2: 20.9, pressure: 101.3, temp: 22.4, humidity: 52, voc: 0.12,
}

export const DEMO_ENV_READINGS: EnvReading[] = Array.from({ length: 24 }, (_, i) => ({
  co2: 3900 + i * 20 + Math.random() * 80,
  o2: 20.9 - i * 0.002,
  pressure: 101.3 + (Math.random() - 0.5) * 0.2,
  temp: 22 + Math.sin(i * 0.4) * 0.8,
  humidity: 50 + Math.random() * 5,
  voc: 0.10 + Math.random() * 0.05,
}))

// ─── Mood ─────────────────────────────────────────────────────────────────────

export const DEMO_MOOD: MoodEntry[] = Array.from({ length: 14 }, (_, i) => ({
  day: 28 + i,
  mood: Math.round(65 + Math.sin(i * 0.6) * 12 + Math.random() * 8),
  stress: Math.round(28 + Math.cos(i * 0.5) * 10 + Math.random() * 6),
  social: Math.round(72 + Math.sin(i * 0.4) * 8),
  sleepStart: 22 + (Math.random() - 0.5) * 1.5,
  activeMin: Math.round(90 + (Math.random() - 0.5) * 30),
}))

// ─── Triage ───────────────────────────────────────────────────────────────────

export const DEMO_TRIAGE: TriageItem[] = [
  {
    alertId: "alert-002",
    title: "Cabin CO2 nudging upper safe band",
    level: "observe",
    lane: "act",
    canWaitMinutes: 240,
    reason: "Scrubber swap within 4 h recommended.",
  },
  {
    alertId: "alert-003",
    title: "EVA suit pressure delta check",
    level: "warning",
    lane: "act",
    canWaitMinutes: 60,
    reason: "Immediate leak check required before pre-breathe routine.",
  },
  {
    alertId: "alert-001",
    title: "HRV trending downward - early fatigue signal",
    level: "observe",
    lane: "monitor",
    canWaitMinutes: 720,
    reason: "Non-urgent; monitor next cycle. Defer EVA if persists.",
  },
  {
    alertId: "alert-004",
    title: "Skin temperature micro-drift (+0.4°C)",
    level: "normal",
    lane: "monitor",
    canWaitMinutes: 1440,
    reason: "Circadian adaptation phase. Re-evaluate at mission day 45.",
  },
  {
    alertId: "alert-005",
    title: "Weekly SANS visual acuity trend report",
    level: "normal",
    lane: "earth",
    canWaitMinutes: 2880,
    reason: "Routine Earth hand-off. Non-urgent flight surgeon review.",
  },
  {
    alertId: "alert-006",
    title: "Cumulative radiation dose ledger update",
    level: "normal",
    lane: "earth",
    canWaitMinutes: 4320,
    reason: "Include in 30-day GCR mission summary for ground control.",
  },
]

export const DEMO_SBAR: SBARReport = {
  situation: "Dr. Vasquez presents with a 14% HRV decline and CO2 level at 4350 ppm on Mission Day 42.",
  background: "She has been in good health for the first 40 days. EVA suit fit checks over days 40-41 disrupted sleep. Scrubber canister B is approaching end-of-life.",
  assessment: "Both signals are in the observe range and likely coupled: mild sleep fragmentation is elevating stress, while elevated CO2 may be amplifying fatigue perception. No immediate danger.",
  recommendation: "1. Swap scrubber canister today. 2. Add 30 min protected rest tonight. 3. Recheck HRV tomorrow morning before EVA go/no-go decision. 4. If HRV remains >10% below baseline after rest, defer EVA and escalate to Flight Surgeon.",
  generatedDay: 42,
  delayMin: 20,
}

// ─── Hazards ──────────────────────────────────────────────────────────────────

export const DEMO_HAZARDS: Hazard[] = [
  { id: "H1", label: "Radiation exposure" },
  { id: "H2", label: "Microgravity deconditioning" },
  { id: "H3", label: "CO2 accumulation" },
  { id: "H4", label: "Sleep disruption" },
  { id: "H5", label: "Behavioral health stress" },
]

export const DEMO_OUTCOMES: Outcome[] = [
  { id: "O1", label: "Cardiovascular decline" },
  { id: "O2", label: "Bone density loss" },
  { id: "O3", label: "Cognitive impairment" },
  { id: "O4", label: "Mission abort" },
]

export const DEMO_HAZARD_LINKS: HazardLink[] = [
  { from: "H1", to: "O3", w: 0.55, signals: ["radiation badge", "solar event log"] },
  { from: "H2", to: "O1", w: 0.72, signals: ["HRV", "HR recovery"] },
  { from: "H2", to: "O2", w: 0.68, signals: ["ARED sessions", "BMD model"] },
  { from: "H3", to: "O3", w: 0.61, signals: ["CO2 ppm", "headache log"] },
  { from: "H4", to: "O1", w: 0.49, signals: ["sleep efficiency", "HRV"] },
  { from: "H4", to: "O3", w: 0.58, signals: ["reaction time", "mood score"] },
  { from: "H5", to: "O4", w: 0.38, signals: ["mood score", "stress index"] },
]

export const DEMO_EXPOSURES: Record<string, number> = {
  H1: 0.31, H2: 0.55, H3: 0.42, H4: 0.38, H5: 0.22,
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

export const DEMO_PRIVACY_TIERS: PrivacyTier[] = [
  { category: "Heart and circulation",       tier: "Medical Officer", note: "Shared with flight surgeon on request" },
  { category: "Sleep and activity",          tier: "Medical Officer", note: "Aggregated trends only" },
  { category: "Mood and stress check-ins",   tier: "Private",         note: "Astronaut-only; not transmitted" },
  { category: "Radiation ledger",            tier: "Mission Control", note: "Regulatory requirement" },
  { category: "Cabin environment",           tier: "Mission Control", note: "ECLSS telemetry stream" },
  { category: "Cognitive and balance tests", tier: "Medical Officer", note: "Results shared post-mission" },
]

function fakeHash(seed: string) {
  let h = 0
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h.toString(16).padStart(8, "0")
}

export const DEMO_AUDIT_LOG: AuditLogEntry[] = [
  { id: 1, ts: "2026-09-21T08:14:02Z", actor: "Astronaut",       action: "Submitted cognitive check result",     hash: fakeHash("1"), prevHash: "0000000" },
  { id: 2, ts: "2026-09-25T14:30:11Z", actor: "Medical Officer", action: "Viewed HRV trend (last 30 days)",      hash: fakeHash("2"), prevHash: fakeHash("1") },
  { id: 3, ts: "2026-09-28T09:05:44Z", actor: "Mission Control", action: "Radiation ledger export approved",     hash: fakeHash("3"), prevHash: fakeHash("2") },
  { id: 4, ts: "2026-10-01T16:22:09Z", actor: "Medical Officer", action: "Updated privacy tier - Mood check-ins",hash: fakeHash("4"), prevHash: fakeHash("3") },
  { id: 5, ts: "2026-10-02T07:48:55Z", actor: "Astronaut",       action: "Flagged CO2 headache symptom",        hash: fakeHash("5"), prevHash: fakeHash("4") },
]

// ─── Validation ───────────────────────────────────────────────────────────────

export const DEMO_VALIDATION: ValidationRun[] = [
  {
    scenario: "6-crew, 180-day Mars transit",
    crews: 12,
    crewSize: 6,
    rows: [
      { method: "VITASTRA v1",      detectionDays: 2.1, falseAlarmsPerCrewMonth: 0.4, alertsPer100h: 1.2, grouped: true  },
      { method: "Threshold rules", detectionDays: 4.7, falseAlarmsPerCrewMonth: 2.8, alertsPer100h: 3.6, grouped: false },
      { method: "No monitoring",   detectionDays: 9.9, falseAlarmsPerCrewMonth: 0.0, alertsPer100h: 0.0, grouped: false },
    ],
  },
]

// ─── Coach ────────────────────────────────────────────────────────────────────

let _coachMessages: CoachMessage[] = [
  {
    id: "msg-001",
    from: "coach",
    text: "Good morning, Elena. Your HRV recovered slightly overnight — 48 ms vs yesterday's 45 ms. Still below your 52 ms baseline, so I'd suggest protecting tonight's sleep window.",
    ts: new Date(Date.now() - 3_600_000).toISOString(),
  },
]

export function getCoachMessages() { return [..._coachMessages] }

export function addCoachMessage(text: string): CoachMessage {
  const userMsg: CoachMessage = {
    id: `msg-user-${Date.now()}`,
    from: "you",
    text,
    ts: new Date().toISOString(),
  }
  _coachMessages = [..._coachMessages, userMsg]
  const reply: CoachMessage = {
    id: `msg-coach-${Date.now() + 1}`,
    from: "coach",
    text: coachReply(text),
    ts: new Date(Date.now() + 800).toISOString(),
  }
  setTimeout(() => { _coachMessages = [..._coachMessages, reply] }, 900)
  return userMsg
}

function coachReply(userText: string): string {
  const t = userText.toLowerCase()
  if (t.includes("hrv"))   return "Your HRV is trending low — likely post-EVA prep fatigue. Aim for 7.5 h sleep tonight and avoid high-intensity exercise tomorrow morning."
  if (t.includes("co2") || t.includes("headache")) return "The CO2 spike to 4350 ppm correlates with your headache. The scrubber swap is the priority fix — also try drinking an extra 250 ml of water."
  if (t.includes("sleep")) return "Sleep efficiency has dipped to ~82% the last two nights. Consider a 10-min pre-sleep relaxation protocol and dimming lights 45 min before your rest period."
  if (t.includes("stress")) return "Your stress index is 1.4 SD above your own baseline. A 5-min breathing exercise (4-7-8 pattern) can lower it measurably within 10 minutes."
  return "I'm monitoring all your signals continuously. Everything is in the observe range — no immediate action needed. Let me know if you have a specific concern."
}

// ─── Comms ────────────────────────────────────────────────────────────────────

export const DEMO_COMMS = { state: "online" as const, delay: 20, queue: 3 }

// ─── Evaluation (main dashboard payload) ──────────────────────────────────────

export function buildEvaluation(day: number): Evaluation {
  const jitter = (base: number, pct: number) => base + (Math.random() - 0.5) * 2 * base * pct

  return {
    day,
    sm: {
      restHR: jitter(58, 0.04), hrv: jitter(48, 0.06), spo2: jitter(97.8, 0.005),
      hrr: jitter(36, 0.08), sleep: jitter(6.9, 0.07), temp: jitter(36.7, 0.01),
      stress: jitter(38, 0.12), mood: jitter(68, 0.10), vision: jitter(1.0, 0.02),
      reaction: jitter(252, 0.06), balance: jitter(93, 0.04), co2: jitter(4350, 0.03),
    },
    z: {
      restHR: 0.3, hrv: -1.4, spo2: -0.2, hrr: -0.5,
      sleep: -0.8, temp: 0.1, stress: 1.4, mood: -0.5,
      vision: 0.0, reaction: 0.4, balance: -0.3, co2: 0.9,
    },
    env: DEMO_ENV_READING,
    live: DEMO_VITALS,
    nowS: DEMO_VITALS[DEMO_VITALS.length - 1],
    gapNow: 20,
    strain: false,
    bone: {
      deliveredFrac: 0.87,
      risk: 0.08,
      baseRisk: 0.05,
      projectedRisk: 0.11,
      outageActive: false,
      devices: [
        { name: "ARED",         planned: 90, logged: 90, delivered: 78 },
        { name: "T2 treadmill", planned: 30, logged: 25, delivered: 25 },
        { name: "CEVIS cycle",  planned: 30, logged: 30, delivered: 30 },
      ],
    },
    dose: DEMO_RADIATION[Math.min(day, 41)],
    doseRate: 0.48,
    cusum: 1.2,
    rawSignals: [
      { id: "hrv",     label: "HRV (rMSSD)",     on: true  },
      { id: "rhr",     label: "Resting HR",       on: true  },
      { id: "spo2",    label: "SpO2",             on: true  },
      { id: "sleep",   label: "Sleep efficiency", on: true  },
      { id: "stress",  label: "Stress index",     on: true  },
      { id: "co2",     label: "Cabin CO2",        on: true  },
      { id: "balance", label: "Balance score",    on: false },
    ],
    alerts: DEMO_ALERTS,
    fault: null,
    twin: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      expected: 60 + Math.sin(h * 0.4) * 5,
      actual: h < 20 ? 62 + Math.sin(h * 0.4) * 4 + Math.random() * 3 : null,
    })),
    signalsA: [
      { id: "hrv",   label: "HRV",     on: true },
      { id: "rhr",   label: "Rest HR", on: true },
      { id: "spo2",  label: "SpO2",    on: true },
      { id: "sleep", label: "Sleep",   on: true },
    ],
    signalsB: [
      { id: "stress",  label: "Stress",  on: true  },
      { id: "mood",    label: "Mood",    on: false },
      { id: "co2",     label: "CO2",     on: true  },
      { id: "balance", label: "Balance", on: false },
    ],
    nextCheck: DEMO_CHECKS.find((c) => !c.done) ?? null,
    adherence: 0.87,
    overall: "observe",
    career: DEMO_CAREER_DOSE,
    mood: DEMO_MOOD[DEMO_MOOD.length - 1],
  }
}

// ─── Timeline events ──────────────────────────────────────────────────────────

export function buildTimeline(day: number) {
  return [
    { day: 0,        type: "milestone", title: "Launch",               detail: "Crew Dragon launch from LC-39A" },
    { day: 2,        type: "milestone", title: "ISS docking",          detail: "Docked to Harmony forward port" },
    { day: 7,        type: "check",     title: "Vision check",         detail: "Baseline BCVA recorded" },
    { day: 14,       type: "exercise",  title: "ARED session #14",     detail: "Lower body focus, 90 min" },
    { day: 17,       type: "radiation", title: "M-class flare",        detail: "6 h shelter in Zvezda" },
    { day: 21,       type: "check",     title: "Cognitive battery",    detail: "COGSCREEN-AE, all scores nominal" },
    { day: 28,       type: "exercise",  title: "CEVIS session #28",    detail: "Aerobic zone 3, 60 min" },
    { day: 35,       type: "milestone", title: "EVA 1 completed",      detail: "6 h 22 min; P6 truss cable repair" },
    { day: 38,       type: "radiation", title: "C-class flare",        detail: "Minor; no action taken" },
    { day: 39,       type: "exercise",  title: "T2 treadmill degraded",detail: "Speed sensor fault; 1-day outage" },
    { day: 42,       type: "alert",     title: "HRV observe alert",    detail: "14% decline vs personal baseline" },
    { day: 42,       type: "alert",     title: "CO2 observe alert",    detail: "4350 ppm, scrubber swap needed" },
    { day: day + 3,  type: "check",     title: "Vision check due",     detail: "Day " + (day + 4) },
    { day: day + 6,  type: "check",     title: "Cognitive battery due",detail: "Day " + (day + 7) },
    { day: day + 8,  type: "milestone", title: "EVA 2 planned",        detail: "Nadir camera mount" },
  ].filter((e) => e.day >= 0)
}
