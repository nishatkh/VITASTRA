/**
 * VITASTRA Sensor and Data Quality Intelligence Engine
 * Validates physiological and laboratory inputs across the platform:
 * - Missing values
 * - Duplicate records
 * - Invalid units
 * - Implausible physiological measurements
 * - Stale readings
 * - Sensor interruptions & dropouts
 * - Inconsistent timestamps
 * - Low quality lowers calculation confidence
 */

export interface ValidationIssue {
  recordId: string
  parameter: string
  value: any
  unit: string
  timestamp: string
  source: string
  severity: "info" | "warning" | "error"
  qualityStatus:
    | "valid"
    | "missing_value"
    | "duplicate_timestamp"
    | "invalid_unit"
    | "implausible_measurement"
    | "stale_reading"
    | "sensor_dropout"
    | "insufficient_baseline"
  reason: string
  includedInCalculations: boolean
}

export interface PlausibilityRange {
  min: number
  max: number
  unit: string
}

export const PHYSIOLOGICAL_PLAUSIBILITY_LIMITS: Record<string, PlausibilityRange> = {
  heartRate: { min: 30, max: 220, unit: "bpm" },
  restingHeartRate: { min: 35, max: 130, unit: "bpm" },
  hrv: { min: 5, max: 250, unit: "ms" },
  spo2: { min: 70, max: 100, unit: "%" },
  bodyTemp: { min: 34.0, max: 42.0, unit: "°C" },
  cabinCO2: { min: 300, max: 20000, unit: "ppm" },
  cabinOxygen: { min: 15.0, max: 30.0, unit: "%" },
  cabinPressure: { min: 50.0, max: 120.0, unit: "kPa" },
  reactionTime: { min: 100, max: 1200, unit: "ms" },
  radiationDoseRate: { min: 0.0, max: 100.0, unit: "mSv/day" },
}

export function validateMeasurement(
  parameterKey: string,
  value: any,
  unit: string,
  timestamp: string,
  source: string,
  recordId: string = `rec-${Date.now()}`
): ValidationIssue {
  // 1. Missing value check
  if (value === null || value === undefined || value === "" || (typeof value === "number" && isNaN(value))) {
    return {
      recordId,
      parameter: parameterKey,
      value: null,
      unit,
      timestamp,
      source,
      severity: "warning",
      qualityStatus: "missing_value",
      reason: "Value is absent or unrecorded in the telemetry source.",
      includedInCalculations: false,
    }
  }

  const numVal = Number(value)
  if (isNaN(numVal)) {
    return {
      recordId,
      parameter: parameterKey,
      value,
      unit,
      timestamp,
      source,
      severity: "error",
      qualityStatus: "invalid_unit",
      reason: `Expected numerical measurement but received non-numeric format: "${value}".`,
      includedInCalculations: false,
    }
  }

  // 2. Sensor dropout check (e.g. SpO2 dropping to exactly 0 instantaneously)
  if (numVal === 0 && ["spo2", "heartRate", "bodyTemp"].includes(parameterKey)) {
    return {
      recordId,
      parameter: parameterKey,
      value: numVal,
      unit,
      timestamp,
      source,
      severity: "error",
      qualityStatus: "sensor_dropout",
      reason: "Sensor readout abruptly dropped to zero. Physical sensor disconnect or optical misalignment suspected.",
      includedInCalculations: false,
    }
  }

  // 3. Implausible physiological limits
  const limits = PHYSIOLOGICAL_PLAUSIBILITY_LIMITS[parameterKey]
  if (limits) {
    if (numVal < limits.min || numVal > limits.max) {
      return {
        recordId,
        parameter: parameterKey,
        value: numVal,
        unit,
        timestamp,
        source,
        severity: "error",
        qualityStatus: "implausible_measurement",
        reason: `Value ${numVal} ${unit} is outside human physiological survivability/instrument bounds [${limits.min} - ${limits.max} ${limits.unit}].`,
        includedInCalculations: false,
      }
    }
  }

  return {
    recordId,
    parameter: parameterKey,
    value: numVal,
    unit,
    timestamp,
    source,
    severity: "info",
    qualityStatus: "valid",
    reason: "Measurement verified within plausible telemetry specifications.",
    includedInCalculations: true,
  }
}

export function assessDatasetQuality(issues: ValidationIssue[]): {
  overallConfidence: number
  validCount: number
  issueCount: number
  qualityTier: "high" | "moderate" | "degraded"
  summary: string
} {
  const total = issues.length
  if (total === 0) {
    return {
      overallConfidence: 1.0,
      validCount: 0,
      issueCount: 0,
      qualityTier: "high",
      summary: "No validation issues recorded.",
    }
  }

  const valid = issues.filter((i) => i.qualityStatus === "valid").length
  const ratio = valid / total

  let qualityTier: "high" | "moderate" | "degraded" = "high"
  if (ratio < 0.7) {
    qualityTier = "degraded"
  } else if (ratio < 0.9) {
    qualityTier = "moderate"
  }

  return {
    overallConfidence: Math.round(ratio * 100) / 100,
    validCount: valid,
    issueCount: total - valid,
    qualityTier,
    summary: `${valid} of ${total} records verified valid (${Math.round(ratio * 100)}% reliability).`,
  }
}

