import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  vitalsApi,
  alertsApi,
  checksApi,
  exerciseApi,
  radiationApi,
  environmentApi,
  moodApi,
  triageApi,
  hazardsApi,
  privacyApi,
  validationApi,
  coachApi,
  commsApi,
  timelineApi,
} from "./clients"
import type {
  Evaluation,
  Alert,
  Check,
  ExerciseSession,
  Outage,
  MoodEntry,
  SBARReport,
  PrivacyTier,
  AuditLogEntry,
  ValidationRun,
  CoachMessage,
  Flags,
} from "./schemas"

const STALE_TIME = 30_000

export function useAstronaut() {
  return useQuery({ queryKey: ["astronaut"], queryFn: vitalsApi.getAstronaut, staleTime: STALE_TIME })
}

export function useEvaluation(day: number) {
  return useQuery({
    queryKey: ["evaluation", day],
    queryFn: () => vitalsApi.getEvaluation(day),
    staleTime: STALE_TIME,
    enabled: day >= 0,
  })
}

export function useBaselines(_day?: number) {
  return useQuery({
    queryKey: ["baselines", _day],
    queryFn: () => vitalsApi.getBaselines(),
    staleTime: STALE_TIME,
  })
}

export function useAlerts() {
  return useQuery({ queryKey: ["alerts"], queryFn: alertsApi.getAlerts, staleTime: STALE_TIME })
}

export function useChecks(range?: { from: number; to: number }) {
  return useQuery({
    queryKey: ["checks", range],
    queryFn: () => checksApi.getChecks(),
    staleTime: STALE_TIME,
  })
}

export function useNextCheck() {
  return useQuery({
    queryKey: ["checks", "next"],
    queryFn: checksApi.getNextCheck,
    staleTime: STALE_TIME,
  })
}

export function useSubmitCheck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: checksApi.submitCheck,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checks"] }),
  })
}

export function useExerciseSessions(range?: { from: number; to: number }) {
  return useQuery({
    queryKey: ["exercise", range],
    queryFn: () => exerciseApi.getSessions(),
    staleTime: STALE_TIME,
  })
}

export function useExerciseOutages() {
  return useQuery({
    queryKey: ["exercise", "outages"],
    queryFn: exerciseApi.getOutages,
    staleTime: STALE_TIME,
  })
}

export function useLogOutage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: exerciseApi.logOutage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercise", "outages"] }),
  })
}

export function useClearOutages() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: exerciseApi.clearOutages,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercise", "outages"] }),
  })
}

export function useRadiationLedger(range?: { from: number; to: number }) {
  return useQuery({
    queryKey: ["radiation", range],
    queryFn: () => radiationApi.getLedger(),
    staleTime: STALE_TIME,
  })
}

export function useSolarEvents() {
  return useQuery({
    queryKey: ["radiation", "solar-events"],
    queryFn: radiationApi.getSolarEvents,
    staleTime: STALE_TIME,
  })
}

export function useCareerDose() {
  return useQuery({
    queryKey: ["radiation", "career"],
    queryFn: radiationApi.getCareerDose,
    staleTime: STALE_TIME,
  })
}

export function useEnvironmentReadings(range?: { from: number; to: number }) {
  return useQuery({
    queryKey: ["environment", range],
    queryFn: () => environmentApi.getReadings(),
    staleTime: STALE_TIME,
  })
}

export function useLatestEnvironment() {
  return useQuery({
    queryKey: ["environment", "latest"],
    queryFn: environmentApi.getLatestReading,
    staleTime: STALE_TIME,
  })
}

export function useMoodEntries(range?: { from: number; to: number }) {
  return useQuery({
    queryKey: ["mood", range],
    queryFn: () => moodApi.getEntries(),
    staleTime: STALE_TIME,
  })
}

export function useAddMoodEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: moodApi.addEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mood"] }),
  })
}

export function useTriage(delay: number) {
  return useQuery({
    queryKey: ["triage", delay],
    queryFn: () => triageApi.getTriage(),
    staleTime: STALE_TIME,
  })
}

export function useSBAR(delay: number) {
  return useQuery({
    queryKey: ["triage", "sbar", delay],
    queryFn: () => triageApi.getSBAR(),
    staleTime: STALE_TIME,
  })
}

export function useSendSBAR() {
  return useMutation({ mutationFn: triageApi.sendSBAR })
}

export function useHazards() {
  return useQuery({
    queryKey: ["hazards"],
    queryFn: hazardsApi.getHazards,
    staleTime: STALE_TIME,
  })
}

export function useHazardOutcomes() {
  return useQuery({
    queryKey: ["hazards", "outcomes"],
    queryFn: hazardsApi.getOutcomes,
    staleTime: STALE_TIME,
  })
}

export function useHazardLinks() {
  return useQuery({
    queryKey: ["hazards", "links"],
    queryFn: hazardsApi.getLinks,
    staleTime: STALE_TIME,
  })
}

export function useHazardExposures(day: number) {
  return useQuery({
    queryKey: ["hazards", "exposures", day],
    queryFn: () => hazardsApi.getExposures(),
    staleTime: STALE_TIME,
    enabled: day >= 0,
  })
}

export function usePrivacyTiers() {
  return useQuery({
    queryKey: ["privacy", "tiers"],
    queryFn: privacyApi.getTiers,
    staleTime: STALE_TIME,
  })
}

export function useSetPrivacyTier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ category, tier }: { category: string; tier: PrivacyTier["tier"] }) =>
      privacyApi.setTier(category, tier),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["privacy", "tiers"] }),
  })
}

export function useAuditLog() {
  return useQuery({
    queryKey: ["privacy", "audit"],
    queryFn: privacyApi.getAuditLog,
    staleTime: STALE_TIME,
  })
}

export function useTamperAudit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: privacyApi.tamperAudit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["privacy", "audit"] }),
  })
}

export function useValidationRuns() {
  return useQuery({
    queryKey: ["validation"],
    queryFn: validationApi.getRuns,
    staleTime: STALE_TIME,
  })
}

export function useRunValidation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ scenario, crewSize }: { scenario: string; crewSize: number }) =>
      validationApi.runValidation(scenario, crewSize),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["validation"] }),
  })
}

export function useCoachMessages() {
  return useQuery({
    queryKey: ["coach"],
    queryFn: coachApi.getMessages,
    staleTime: STALE_TIME,
  })
}

export function useSendCoachMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: coachApi.sendMessage,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coach"] }),
  })
}

export function useCoachPrompt() {
  return useMutation({ mutationFn: coachApi.setPrompt })
}

export function useCommsStatus() {
  return useQuery({
    queryKey: ["comms"],
    queryFn: commsApi.getStatus,
    staleTime: 5_000,
    refetchInterval: 30_000,
  })
}

export function useSetDelay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: commsApi.setDelay,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comms"] }),
  })
}

export function useFlags() {
  return useQuery({
    queryKey: ["flags"],
    queryFn: () => Promise.resolve({
      feelFine: false,
      co2Event: false,
      solarEvent: false,
      sensorMode: "none" as const,
    }),
    staleTime: Infinity,
  })
}

export function useSetFlag() {
  return useMutation({
    mutationFn: async () => {},
  })
}

export function useCognitiveResult() {
  return useQuery({
    queryKey: ["cognitive", "result"],
    queryFn: async () => {
      // This would call an API endpoint - for now return null
      return null as { reaction: number; sway: number; day: number } | null
    },
    staleTime: STALE_TIME,
  })
}

export function useTimelineEvents(day: number, _outages?: { id: number; machine: string; day: number; days: number }[]) {
  return useQuery({
    queryKey: ["timeline", day],
    queryFn: () => timelineApi.getEvents(day),
    staleTime: STALE_TIME,
    enabled: day >= 0,
  })
}

export { useApp } from "../store/useApp"

export function useConnection() {
  const { data } = useCommsStatus()
  return {
    state: data?.state ?? ("online" as const),
    delay: data?.delay ?? 0,
    queue: data?.queue ?? 0,
  }
}