import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Role, Tier, Flags, AuditLogEntry } from "../data/types"

export interface UIState {
  theme: "light" | "dark" | "system"
  textSize: "small" | "medium" | "large"
  gloveMode: boolean
  reducedMotion: boolean
  role: Role
  delay: 0 | 5 | 20 | 40
  day: number
  tamperedId: number | null
  coachPrompt: string
  tiers: Record<string, Tier>
  flags: Flags
  queue: () => void
  audit_: (actor: Role, action: string) => void
  setTheme: (t: "light" | "dark" | "system") => void
  setTextSize: (s: "small" | "medium" | "large") => void
  setGloveMode: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setRole: (r: Role) => void
  setDelay: (d: 0 | 5 | 20 | 40) => void
  setDay: (d: number) => void
  setTamperedId: (id: number | null) => void
  setCoachPrompt: (p: string) => void
  setTier: (cat: string, t: Tier) => void
  setFlag: <K extends keyof Flags>(k: K, v: Flags[K]) => void
}

const DEFAULT_FLAGS: Flags = {
  feelFine: false,
  co2Event: false,
  solarEvent: false,
  sensorMode: "none",
}

const DEFAULT_TIERS: Record<string, Tier> = {
  "Heart and circulation": "Medical Officer",
  "Sleep and activity": "Medical Officer",
  "Mood and stress check-ins": "Private",
  "Radiation ledger": "Mission Control",
  "Cabin environment": "Mission Control",
  "Cognitive and balance tests": "Medical Officer",
}

export const useApp = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      textSize: "medium",
      gloveMode: false,
      reducedMotion: false,
      role: "Astronaut",
      delay: 0,
      day: 0,
      tamperedId: null,
      coachPrompt: "",
      tiers: DEFAULT_TIERS,
      flags: DEFAULT_FLAGS,
      queue: () => {},
      audit_: (_actor: Role, _action: string) => {},
      setTheme: (theme) => set({ theme }),
      setTextSize: (textSize) => set({ textSize }),
      setGloveMode: (gloveMode) => set({ gloveMode }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setRole: (role) => set({ role }),
      setDelay: (delay) => set({ delay }),
      setDay: (day) => set({ day }),
      setTamperedId: (tamperedId) => set({ tamperedId }),
      setCoachPrompt: (coachPrompt) => set({ coachPrompt }),
      setTier: (cat, t) => set((s) => ({ tiers: { ...s.tiers, [cat]: t } })),
      setFlag: (k, v) => set((s) => ({ flags: { ...s.flags, [k]: v } })),
    }),
    {
      name: "astra-ui-prefs",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        theme: s.theme,
        textSize: s.textSize,
        gloveMode: s.gloveMode,
        reducedMotion: s.reducedMotion,
        role: s.role,
        delay: s.delay,
        day: s.day,
        tamperedId: s.tamperedId,
        coachPrompt: s.coachPrompt,
        tiers: s.tiers,
        flags: s.flags,
      }),
    },
  ),
)

export async function hydrate() {
  return Promise.resolve()
}

export function verifyChain(entries: AuditLogEntry[], tamperedId: number | null) {
  let broken: number | null = null
  const res = entries.map((e) => {
    const ok = tamperedId === null || e.id !== tamperedId
    if (!ok && broken === null) {
      broken = e.id
    }
    return { ...e, ok }
  })
  return { res, broken }
}