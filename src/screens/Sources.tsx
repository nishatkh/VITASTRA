import { Radio } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, SourceChip, Title } from "../components/ui"
import { EmptyState } from "../components/EmptyState"

export default function Sources() {
  return (
    <Screen>
      <Title a="Data" b="Sources" />
      <p className="text-[15px] leading-snug text-label">
        Every number in VITASTRA is labelled real or synthetic. Nothing is
        fetched while the app runs.
      </p>
      <EmptyState
        icon={<Radio size={36} strokeWidth={1.4} />}
        title="No data sources configured"
        description="Data sources will appear here when the backend is connected. Each source shows its origin, what it's used for, and whether it's synthetic or from a real dataset like NASA OSDR, RadLab, or DONKI."
      />
      <Card className="p-5">
        <div className="label mb-1">Offline by design</div>
        <p className="mt-2 text-[15px] leading-relaxed">
          <code className="rounded bg-border px-1.5 py-0.5 text-[13px]">
            scripts/fetch_nasa_data.py
          </code>{" "}
          downloads NASA data into a local database for offline operation. Fonts and assets are bundled. No CDN or API call happens at runtime.
        </p>
      </Card>
      <Card className="p-5">
        <div className="label mb-1">Honesty note</div>
        <p className="text-[14px] leading-snug">
          Inspiration4 biomarkers show direction of change only. n=4, not
          statistics. RadLab gives absorbed dose; any conversion to effective
          dose is an assumption.
        </p>
      </Card>
    </Screen>
  )
}