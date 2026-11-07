import { useState, useMemo } from "react"
import {
  Search,
  BookOpen,
  Filter,
  ExternalLink,
  Microscope,
  ShieldAlert,
  Calendar,
  Building2,
  Tag,
  CheckCircle2,
  X,
} from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Title, SourceChip } from "../components/ui"
import researchData from "../data/processed/space_biology_research.json"

export interface ResearchEntry {
  id: string
  title: string
  organization: string
  publicationDate: string
  source: string
  biologicalModel: string
  experimentContext: string
  mainFindings: string
  relevanceToAstronautHealth: string
  limitations: string
  evidenceClassification: string
  sourceLink: string
  category: string
}

const CATEGORIES = [
  "All Categories",
  "Neurobiology & Organoids",
  "Cardiovascular Models",
  "Immunology & Saliva Biomarkers",
  "Musculoskeletal & Countermeasures",
  "Renal & Metabolic Models",
  "Pulmonary & Closed Environment",
  "Gastrointestinal & Microbiome",
]

const CLASSIFICATIONS = [
  "All Classifications",
  "Established evidence",
  "Emerging research",
  "Experimental evidence",
]

export default function ResearchLibrary() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedClassification, setSelectedClassification] = useState("All Classifications")
  const [activeModalEntry, setActiveModalEntry] = useState<ResearchEntry | null>(null)

  const entries = researchData as ResearchEntry[]

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.biologicalModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.mainFindings.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "All Categories" || entry.category === selectedCategory

      const matchesClass =
        selectedClassification === "All Classifications" ||
        entry.evidenceClassification === selectedClassification

      return matchesSearch && matchesCategory && matchesClass
    })
  }, [entries, searchQuery, selectedCategory, selectedClassification])

  return (
    <Screen>
      <div className="col-span-full">
        <Title a="Space Biology" b="Research Library" />
      </div>

      {/* Overview & Scientific Disclaimer Banner */}
      <section className="col-span-full rounded-[24px] border border-border bg-raised p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <BookOpen className="mt-0.5 size-6 shrink-0 text-ink" />
          <div className="space-y-1">
            <h2 className="text-[16px] sm:text-[18px] font-semibold text-ink">
              Peer-Reviewed Space Biology & Microphysiological Systems Intelligence
            </h2>
            <p className="text-[13.5px] leading-relaxed text-label">
              Authoritative scientific catalog encompassing NASA Open Science Data Repository (OSDR), ISS National Lab payloads, tissue chips, and astronaut longitudinal investigations. All entries rigorously distinguish between in vitro cellular models, animal studies, and verified human astronaut physiological outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Controls */}
      <Card className="col-span-full p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-label" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organoids, cardiac models, cytokines, etc..."
              className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2.5 text-[14px] text-ink placeholder:text-label focus:border-accent focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-[14px] font-medium text-ink focus:border-accent focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Classification Filter */}
          <div>
            <select
              value={selectedClassification}
              onChange={(e) => setSelectedClassification(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-border bg-surface px-4 py-2.5 text-[14px] font-medium text-ink focus:border-accent focus:outline-none"
            >
              {CLASSIFICATIONS.map((cl) => (
                <option key={cl} value={cl}>
                  {cl}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-[12.5px] text-label border-t border-border pt-3">
          <span>Showing {filteredEntries.length} of {entries.length} research studies</span>
          {(searchQuery || selectedCategory !== "All Categories" || selectedClassification !== "All Classifications") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All Categories")
                setSelectedClassification("All Classifications")
              }}
              className="font-medium text-accent hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </Card>

      {/* Research Grid */}
      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="flex flex-col justify-between rounded-[28px] border border-border bg-surface p-5 shadow-xs hover:border-accent/40 transition-all duration-200"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11.5px] font-semibold ${
                  entry.evidenceClassification === "Established evidence"
                    ? "bg-signal/15 text-signal"
                    : entry.evidenceClassification === "Emerging research"
                    ? "bg-accent/15 text-accent"
                    : "bg-warning/15 text-warning"
                }`}>
                  {entry.evidenceClassification}
                </span>
                <span className="text-[12px] text-label font-mono">
                  {entry.publicationDate}
                </span>
              </div>

              <div>
                <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-ink">
                  {entry.title}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-label">
                  <Building2 className="size-3.5 shrink-0" />
                  <span className="truncate">{entry.organization}</span>
                </div>
              </div>

              <div className="rounded-xl bg-raised p-3 text-[13px] text-label space-y-1">
                <div>
                  <strong className="text-ink font-medium">Model:</strong> {entry.biologicalModel}
                </div>
                <p className="line-clamp-2 leading-snug">
                  <strong className="text-ink font-medium">Findings:</strong> {entry.mainFindings}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <span className="text-[12px] text-label font-medium truncate max-w-[200px]">
                {entry.source}
              </span>
              <button
                onClick={() => setActiveModalEntry(entry)}
                className="inline-flex items-center gap-1.5 rounded-full bg-raised px-4 py-1.5 text-[13px] font-medium text-ink hover:bg-border transition-colors"
              >
                Inspect Study
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail View */}
      {activeModalEntry && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nav/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-[32px] bg-surface p-6 shadow-2xl border border-border space-y-5">
            <button
              onClick={() => setActiveModalEntry(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-label hover:bg-raised hover:text-ink transition-colors"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>

            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-[11.5px] font-semibold ${
                activeModalEntry.evidenceClassification === "Established evidence"
                  ? "bg-signal/15 text-signal"
                  : activeModalEntry.evidenceClassification === "Emerging research"
                  ? "bg-accent/15 text-accent"
                  : "bg-warning/15 text-warning"
              }`}>
                {activeModalEntry.evidenceClassification}
              </span>
              <h2 className="mt-2 text-[22px] font-semibold tracking-tight text-ink">
                {activeModalEntry.title}
              </h2>
              <div className="mt-1 text-[13px] text-label">
                {activeModalEntry.organization} · {activeModalEntry.source} ({activeModalEntry.publicationDate})
              </div>
            </div>

            <div className="space-y-3.5 text-[14px] leading-relaxed">
              <div className="rounded-2xl bg-raised p-4 space-y-1">
                <div className="label !text-[11px]">Biological Model & Assay</div>
                <div className="font-semibold text-ink">{activeModalEntry.biologicalModel}</div>
                <div className="text-[13px] text-label">{activeModalEntry.experimentContext}</div>
              </div>

              <div>
                <h4 className="font-semibold text-ink">Main Findings:</h4>
                <p className="mt-1 text-label">{activeModalEntry.mainFindings}</p>
              </div>

              <div>
                <h4 className="font-semibold text-ink">Relevance to Astronaut Health:</h4>
                <p className="mt-1 text-label">{activeModalEntry.relevanceToAstronautHealth}</p>
              </div>

              <div className="rounded-2xl border border-warning/30 bg-warning/5 p-4 text-[13px] text-label space-y-1">
                <div className="flex items-center gap-2 font-semibold text-warning">
                  <ShieldAlert className="size-4 shrink-0" />
                  Model Limitations & Translation Disclosures:
                </div>
                <p>{activeModalEntry.limitations}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <a
                href={activeModalEntry.sourceLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-medium text-canvas hover:opacity-90 transition-opacity"
              >
                Access Source Literature
                <ExternalLink className="size-4" />
              </a>
              <button
                onClick={() => setActiveModalEntry(null)}
                className="rounded-full px-5 py-2.5 text-[13.5px] font-medium text-label hover:text-ink"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Screen>
  )
}

