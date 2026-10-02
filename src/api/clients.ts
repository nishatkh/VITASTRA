/**
 * API clients — wired to the in-memory demo mock layer.
 * Swap DEMO_MODE to false and restore http.* calls when a real backend is available.
 */
import {
  DEMO_ASTRONAUT,
  DEMO_BASELINES,
  DEMO_VITALS,
  DEMO_ALERTS,
  DEMO_CHECKS,
  DEMO_EXERCISE,
  DEMO_OUTAGES,
  DEMO_RADIATION,
  DEMO_SOLAR_EVENTS,
  DEMO_CAREER_DOSE,
  DEMO_ENV_READING,
  DEMO_ENV_READINGS,
  DEMO_MOOD,
  DEMO_TRIAGE,
  DEMO_SBAR,
  DEMO_HAZARDS,
  DEMO_OUTCOMES,
  DEMO_HAZARD_LINKS,
  DEMO_EXPOSURES,
  DEMO_PRIVACY_TIERS,
  DEMO_AUDIT_LOG,
  DEMO_VALIDATION,
  DEMO_COMMS,
  getCoachMessages,
  addCoachMessage,
  buildEvaluation,
  buildTimeline,
} from "./mock"

import type {
  PrivacyTier,
  Outage,
  ExerciseSession,
  MoodEntry,
  Check,
  SBARReport,
  ValidationRun,
} from "./schemas"

const delay = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms))

// ─── Vitals ───────────────────────────────────────────────────────────────────

export const vitalsApi = {
  getAstronaut: async () => { await delay(); return DEMO_ASTRONAUT },
  getVitals: async () => { await delay(); return DEMO_VITALS },
  getLatestVital: async () => { await delay(); return DEMO_VITALS[DEMO_VITALS.length - 1] },
  getBaselines: async () => { await delay(); return DEMO_BASELINES },
  getEvaluation: async (day: number) => { await delay(180); return buildEvaluation(day) },
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const alertsApi = {
  getAlerts: async () => { await delay(); return DEMO_ALERTS },
  getAlert: async (id: string) => {
    await delay()
    const a = DEMO_ALERTS.find((x) => x.id === id)
    if (!a) throw new Error(`Alert ${id} not found`)
    return a
  },
}

// ─── Checks ───────────────────────────────────────────────────────────────────

let _checks = [...DEMO_CHECKS]

export const checksApi = {
  getChecks: async () => { await delay(); return _checks },
  getNextCheck: async () => { await delay(); return _checks.find((c) => !c.done) ?? null },
  submitCheck: async (check: Omit<Check, "id">) => {
    await delay(250)
    const done = { ...check, id: `chk-${Date.now()}` } as Check
    _checks = [..._checks, done]
    return done
  },
}

// ─── Exercise ─────────────────────────────────────────────────────────────────

let _sessions = [...DEMO_EXERCISE]
let _outages = [...DEMO_OUTAGES]

export const exerciseApi = {
  getSessions: async () => { await delay(); return _sessions },
  logSession: async (session: Omit<ExerciseSession, "day">) => {
    await delay(200)
    const s = { ...session, day: 42 } as ExerciseSession
    _sessions = [..._sessions, s]
    return s
  },
  getOutages: async () => { await delay(); return _outages },
  logOutage: async (outage: Omit<Outage, "id">) => {
    await delay(200)
    const o = { ...outage, id: Date.now() } as Outage
    _outages = [..._outages, o]
    return o
  },
  clearOutages: async () => { await delay(200); _outages = []; return undefined as void },
}

// ─── Radiation ────────────────────────────────────────────────────────────────

export const radiationApi = {
  getLedger: async () => { await delay(); return DEMO_RADIATION },
  getSolarEvents: async () => { await delay(); return DEMO_SOLAR_EVENTS },
  getCareerDose: async () => { await delay(); return DEMO_CAREER_DOSE },
}

// ─── Environment ──────────────────────────────────────────────────────────────

export const environmentApi = {
  getReadings: async () => { await delay(); return DEMO_ENV_READINGS },
  getLatestReading: async () => { await delay(); return DEMO_ENV_READING },
}

// ─── Mood ─────────────────────────────────────────────────────────────────────

let _mood = [...DEMO_MOOD]

export const moodApi = {
  getEntries: async () => { await delay(); return _mood },
  addEntry: async (entry: Omit<MoodEntry, "day">) => {
    await delay(200)
    const e = { ...entry, day: 42 } as MoodEntry
    _mood = [..._mood, e]
    return e
  },
}

// ─── Triage ───────────────────────────────────────────────────────────────────

export const triageApi = {
  getTriage: async () => { await delay(); return DEMO_TRIAGE },
  getSBAR: async () => { await delay(300); return DEMO_SBAR },
  sendSBAR: async (_report: SBARReport) => { await delay(400); return undefined as void },
}

// ─── Hazards ──────────────────────────────────────────────────────────────────

export const hazardsApi = {
  getHazards: async () => { await delay(); return DEMO_HAZARDS },
  getOutcomes: async () => { await delay(); return DEMO_OUTCOMES },
  getLinks: async () => { await delay(); return DEMO_HAZARD_LINKS },
  getExposures: async () => { await delay(); return DEMO_EXPOSURES },
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

let _tiers = [...DEMO_PRIVACY_TIERS]
let _auditLog = [...DEMO_AUDIT_LOG]

export const privacyApi = {
  getTiers: async () => { await delay(); return _tiers },
  setTier: async (category: string, tier: PrivacyTier["tier"]) => {
    await delay(200)
    _tiers = _tiers.map((t) => t.category === category ? { ...t, tier } : t)
    const updated = _tiers.find((t) => t.category === category)!
    // Log to audit
    const prev = _auditLog[_auditLog.length - 1]
    const newEntry = {
      id: _auditLog.length + 1,
      ts: new Date().toISOString(),
      actor: "Medical Officer" as const,
      action: `Updated privacy tier for "${category}" to "${tier}"`,
      hash: Math.random().toString(16).slice(2, 10),
      prevHash: prev?.hash ?? "0000000",
    }
    _auditLog = [..._auditLog, newEntry]
    return updated
  },
  getAuditLog: async () => { await delay(); return _auditLog },
  tamperAudit: async (id: number | null) => {
    await delay(200)
    if (id !== null) {
      _auditLog = _auditLog.map((e) =>
        e.id === id ? { ...e, action: e.action + " [TAMPERED]" } : e
      )
    }
    return undefined as void
  },
}

// ─── Validation ───────────────────────────────────────────────────────────────

let _runs = [...DEMO_VALIDATION]

export const validationApi = {
  getRuns: async () => { await delay(); return _runs },
  runValidation: async (scenario: string, crewSize: number) => {
    await delay(800)
    const run: ValidationRun = {
      scenario,
      crews: 8,
      crewSize,
      rows: [
        { method: "VITASTRA v1",      detectionDays: 2.3, falseAlarmsPerCrewMonth: 0.5, alertsPer100h: 1.3, grouped: true  },
        { method: "Threshold rules", detectionDays: 5.1, falseAlarmsPerCrewMonth: 3.0, alertsPer100h: 3.9, grouped: false },
      ],
    }
    _runs = [..._runs, run]
    return run
  },
}

// ─── Coach ────────────────────────────────────────────────────────────────────

export const coachApi = {
  getMessages: async () => { await delay(); return getCoachMessages() },
  sendMessage: async (text: string) => { await delay(100); return addCoachMessage(text) },
  setPrompt: async (_prompt: string) => { await delay(100); return undefined as void },
}

// ─── Comms ────────────────────────────────────────────────────────────────────

let _comms: { state: "online" | "offline" | "delayed"; delay: number; queue: number } = { ...DEMO_COMMS }

export const commsApi = {
  getStatus: async () => { await delay(50); return _comms },
  setDelay: async (d: 0 | 5 | 20 | 40) => {
    await delay(100)
    _comms = { ..._comms, delay: d, state: d === 0 ? ("online" as const) : ("delayed" as const) }
    return undefined as void
  },
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export const timelineApi = {
  getEvents: async (day: number) => { await delay(); return buildTimeline(day) },
}
