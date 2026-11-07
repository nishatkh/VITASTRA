/**
 * Personal Astronaut Health Baseline Engine
 * Applies statistically sound methods (Mean/SD, Median/MAD, Z-scores)
 * Strictly adheres to non-negotiable rules:
 * - Requires at least 2 valid observations for standard deviation calculation
 * - Does not invent clinical diagnoses from statistical deviations
 * - Explicitly communicates uncertainty and sample size
 */

export interface BaselineStatistic {
  metric: string
  sampleCount: number
  mean: number | null
  sd: number | null
  median: number | null
  mad: number | null
  min: number | null
  max: number | null
  unit: string
  status: "sufficient" | "insufficient_data" | "zero_variance" | "no_data"
  reason?: string
}

export interface DeviationAnalysis {
  observedValue: number
  baselineMean: number | null
  baselineSd: number | null
  zScore: number | null
  medianDeviation: number | null
  classification: "nominal" | "mild_statistical_change" | "meaningful_deviation" | "insufficient_baseline"
  uncertaintyLevel: "low" | "medium" | "high"
  explanation: string
}

export function computeBaseline(
  values: number[],
  unit: string,
  metricName: string
): BaselineStatistic {
  const valid = values.filter((v) => typeof v === "number" && !isNaN(v) && isFinite(v))
  const n = valid.length

  if (n === 0) {
    return {
      metric: metricName,
      sampleCount: 0,
      mean: null,
      sd: null,
      median: null,
      mad: null,
      min: null,
      max: null,
      unit,
      status: "no_data",
      reason: "No valid historical measurements recorded.",
    }
  }

  if (n < 2) {
    return {
      metric: metricName,
      sampleCount: n,
      mean: valid[0],
      sd: null,
      median: valid[0],
      mad: null,
      min: valid[0],
      max: valid[0],
      unit,
      status: "insufficient_data",
      reason: "Requires at least 2 valid observations for standard deviation and baseline dispersion.",
    }
  }

  // Mean & Sample Standard Deviation
  const sum = valid.reduce((acc, x) => acc + x, 0)
  const mean = sum / n
  const variance = valid.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (n - 1)
  const sd = Math.sqrt(variance)

  // Median
  const sorted = [...valid].sort((a, b) => a - b)
  const mid = Math.floor(n / 2)
  const median = n % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2

  // Median Absolute Deviation (MAD)
  const absDevs = valid.map((x) => Math.abs(x - median)).sort((a, b) => a - b)
  const mad = n % 2 !== 0 ? absDevs[mid] : (absDevs[mid - 1] + absDevs[mid]) / 2

  if (sd < 1e-9) {
    return {
      metric: metricName,
      sampleCount: n,
      mean: Math.round(mean * 1000) / 1000,
      sd: 0,
      median: Math.round(median * 1000) / 1000,
      mad: 0,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      unit,
      status: "zero_variance",
      reason: "All recorded baseline measurements are identical (zero variance).",
    }
  }

  return {
    metric: metricName,
    sampleCount: n,
    mean: Math.round(mean * 1000) / 1000,
    sd: Math.round(sd * 1000) / 1000,
    median: Math.round(median * 1000) / 1000,
    mad: Math.round(mad * 1000) / 1000,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    unit,
    status: "sufficient",
  }
}

export function analyzeDeviation(
  observed: number,
  baseline: BaselineStatistic
): DeviationAnalysis {
  if (baseline.status !== "sufficient" || baseline.mean === null || baseline.sd === null || baseline.sd <= 0) {
    return {
      observedValue: observed,
      baselineMean: baseline.mean,
      baselineSd: baseline.sd,
      zScore: null,
      medianDeviation: baseline.median !== null ? Math.round((observed - baseline.median) * 1000) / 1000 : null,
      classification: "insufficient_baseline",
      uncertaintyLevel: "high",
      explanation: baseline.reason || "Baseline data is insufficient to compute a valid z-score.",
    }
  }

  const z = (observed - baseline.mean) / baseline.sd
  const roundedZ = Math.round(z * 1000) / 1000
  const absZ = Math.abs(z)

  let classification: DeviationAnalysis["classification"] = "nominal"
  if (absZ >= 2.5) {
    classification = "meaningful_deviation"
  } else if (absZ >= 1.5) {
    classification = "mild_statistical_change"
  }

  const uncertainty: DeviationAnalysis["uncertaintyLevel"] =
    baseline.sampleCount >= 10 ? "low" : baseline.sampleCount >= 4 ? "medium" : "high"

  const dir = z > 0 ? "above" : "below"
  const explanation =
    absZ < 1.5
      ? `Measurement is within ${absZ.toFixed(1)} standard deviations of your personal baseline mean (${baseline.mean} ${baseline.unit}).`
      : `Measurement is ${Math.abs(roundedZ).toFixed(2)} SD ${dir} your personal baseline (${baseline.mean} ± ${baseline.sd} ${baseline.unit}). Statistical shift, not a clinical diagnosis.`

  return {
    observedValue: observed,
    baselineMean: baseline.mean,
    baselineSd: baseline.sd,
    zScore: roundedZ,
    medianDeviation: baseline.median !== null ? Math.round((observed - baseline.median) * 1000) / 1000 : null,
    classification,
    uncertaintyLevel: uncertainty,
    explanation,
  }
}

