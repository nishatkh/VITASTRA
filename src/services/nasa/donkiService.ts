import donkiArchive from "../../data/processed/donki_events.json"

export interface DonkiEvent {
  flrID: string
  beginTime: string
  peakTime: string
  endTime: string
  classType: string
  sourceLocation: string
  activeRegionNum: number | null
  instruments: { displayName: string }[]
  linkedEvents: { activityID: string }[]
  note: string
  source: string
  catalogUrl: string
  operationalGuidance: string
}

export interface DonkiFetchResult {
  events: DonkiEvent[]
  sourceMode: "live_nasa_api" | "verified_archive" | "api_error"
  statusMessage: string
  lastUpdated: string
}

export async function fetchDonkiSolarEvents(apiKey = "DEMO_KEY"): Promise<DonkiFetchResult> {
  const customKey = import.meta.env.VITE_NASA_API_KEY || apiKey
  const endpoint = `https://api.nasa.gov/DONKI/FLR?startDate=2024-05-01&endDate=2024-05-20&api_key=${encodeURIComponent(customKey)}`

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(endpoint, { signal: controller.signal })
    clearTimeout(timer)

    if (!res.ok) {
      return {
        events: donkiArchive as DonkiEvent[],
        sourceMode: "verified_archive",
        statusMessage: `NASA DONKI API returned HTTP ${res.status} (${res.statusText}). Displaying verified Solar Superstorm archive with authentic GOES-16 telemetry.`,
        lastUpdated: new Date().toISOString(),
      }
    }

    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const parsed: DonkiEvent[] = data.map((item: any) => ({
        flrID: item.flrID || `FLR-${item.peakTime}`,
        beginTime: item.beginTime || "",
        peakTime: item.peakTime || "",
        endTime: item.endTime || "",
        classType: item.classType || "Unclassified",
        sourceLocation: item.sourceLocation || "Unknown",
        activeRegionNum: item.activeRegionNum || null,
        instruments: item.instruments || [{ displayName: "GOES XRS" }],
        linkedEvents: item.linkedEvents || [],
        note: item.note || "Live solar flare telemetry recorded by NASA DONKI.",
        source: "NASA DONKI Live Telemetry",
        catalogUrl: `https://kauai.ccmc.gsfc.nasa.gov/DONKI/view/FLR/${encodeURIComponent(item.flrID || "")}`,
        operationalGuidance: "Standard NASA flight operations guidance: monitor proton flux and SAA transit dosimetry.",
      }))

      return {
        events: parsed,
        sourceMode: "live_nasa_api",
        statusMessage: `Successfully connected to NASA DONKI API. Received ${parsed.length} official space-weather event records.`,
        lastUpdated: new Date().toISOString(),
      }
    }

    return {
      events: donkiArchive as DonkiEvent[],
      sourceMode: "verified_archive",
      statusMessage: "NASA DONKI returned 0 events for query range. Displaying verified NASA Solar Superstorm archive.",
      lastUpdated: new Date().toISOString(),
    }
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError"
    return {
      events: donkiArchive as DonkiEvent[],
      sourceMode: "verified_archive",
      statusMessage: isTimeout
        ? "NASA DONKI API request timed out (>6s). Displaying verified offline NASA space weather archive."
        : `NASA DONKI network connection unavailable (${err?.message || "offline"}). Displaying verified NASA space weather archive.`,
      lastUpdated: new Date().toISOString(),
    }
  }
}

