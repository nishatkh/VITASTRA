const BASE_MEAN = { reaction: 265, balance: 1.0 }
const BASE_SD = { reaction: 8, balance: 0.06 }

export interface TestResult {
  reaction: number
  sway: number
  day: number
}
export function fitness(reaction: number, sway: number, sleepZ: number) {
  const zr = (reaction - BASE_MEAN.reaction) / BASE_SD.reaction
  const zb = (sway - BASE_MEAN.balance) / BASE_SD.balance
  const reasons: string[] = []
  let pts = 0
  if (zr >= 3) {
    pts += 2
    reasons.push(
      `Reaction time ${Math.round(reaction)} ms is well above your baseline of ${Math.round(BASE_MEAN.reaction)} ms`,
    )
  } else if (zr >= 1.5) {
    pts += 1
    reasons.push(
      `Reaction time ${Math.round(reaction)} ms is above your baseline`,
    )
  } else
    reasons.push(
      `Reaction time ${Math.round(reaction)} ms is within your baseline`,
    )
  if (zb >= 3) {
    pts += 2
    reasons.push(`Balance sway ${sway.toFixed(2)} is well above your baseline`)
  } else if (zb >= 1.5) {
    pts += 1
    reasons.push(`Balance sway ${sway.toFixed(2)} is above your baseline`)
  } else reasons.push(`Balance sway ${sway.toFixed(2)} is within your baseline`)
  if (sleepZ <= -2) {
    pts += 1
    reasons.push("Recent sleep is shorter than your baseline")
  }
  const verdict = pts >= 4 ? "Not recommended" : pts >= 1 ? "Caution" : "Fit"
  return { verdict: verdict as "Fit" | "Caution" | "Not recommended", reasons }
}
export const loadResult = (): TestResult | null => {
  try {
    return JSON.parse(localStorage.getItem("astrax.test") ?? "null")
  } catch {
    return null
  }
}
export const saveResult = (r: TestResult) => {
  try {
    localStorage.setItem("astrax.test", JSON.stringify(r))
  } catch {
    /* noop */
  }
}
