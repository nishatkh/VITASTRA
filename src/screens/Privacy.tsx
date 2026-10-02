import { Lock, ShieldCheck, ShieldAlert } from "lucide-react"
import { Screen } from "../components/Layout"
import { Card, Segmented, Title } from "../components/ui"
import { usePrivacyTiers, useSetPrivacyTier, useAuditLog, useTamperAudit } from "../api/hooks"
import { useApp } from "../store/useApp"
import { verifyChain } from "../store/useApp"
import { EmptyState } from "../components/EmptyState"
import type { Tier, AuditLogEntry } from "../data/types"

const TIERS: Tier[] = ["Private", "Medical Officer", "Mission Control"]
const ROLES = [
  {
    r: "Astronaut",
    d: "Sees everything about themselves. Chooses what to share.",
  },
  {
    r: "Medical Officer",
    d: "Sees categories shared at Medical Officer level or wider.",
  },
  {
    r: "Mission Control",
    d: "Sees only categories shared at Mission Control level.",
  },
]

export default function Privacy() {
  const { data: tiersData, isLoading: tiersLoading } = usePrivacyTiers()
  const setTier = useSetPrivacyTier()
  const { data: auditData, isLoading: auditLoading } = useAuditLog()
  const tamper = useTamperAudit()
  const tamperedId = useApp((s) => s.tamperedId)

  const tiers = tiersData ?? []
  const audit = auditData ?? []

  const { res, broken } = verifyChain(audit, tamperedId)

  if (tiersLoading || auditLoading) {
    return (
      <Screen>
        <Title a="Privacy" b="& Security" />
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-border rounded" />
          <div className="h-20 bg-border rounded" />
          <div className="h-20 bg-border rounded" />
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Title a="Privacy" b="& Security" />
      <Card className="flex items-center gap-4 p-5">
        <span className="icon-btn size-12">
          <Lock size={20} strokeWidth={1.5} />
        </span>
        <div>
          <div className="text-[16px] font-semibold">Encrypted storage: on</div>
          <div className="text-[13px] text-label">
            Data stays on this device (IndexedDB). AES-256 at rest in the flight
            build.
          </div>
        </div>
      </Card>
      <div className="label">Who sees what</div>
      <div className="flex flex-col gap-3">
        {tiers.map((p) => (
          <Card key={p.category} className="p-4">
            <div className="text-[15.5px] font-semibold">{p.category}</div>
            <div className="mb-3 text-[13px] text-label">{p.note}</div>
            <Segmented
              label={`${p.category} visibility`}
              value={p.tier}
              options={TIERS}
              onChange={(t) => setTier.mutate({ category: p.category, tier: t })}
            />
          </Card>
        ))}
        {tiers.length === 0 && (
          <EmptyState
            icon={<Lock size={36} strokeWidth={1.4} />}
            title="No privacy tiers configured"
            description="Privacy tiers will appear when connected to a backend. Each category lets you choose who can see that data: Private, Medical Officer, or Mission Control."
          />
        )}
      </div>
      <div className="label">Roles</div>
      <Card className="divide-y divide-border p-2">
        {ROLES.map((r) => (
          <div key={r.r} className="p-3">
            <div className="font-semibold">{r.r}</div>
            <div className="text-[13.5px] text-label">{r.d}</div>
          </div>
        ))}
      </Card>
      <div className="label">Tamper-evident audit log</div>
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2 text-[14px] font-semibold">
          {broken ? (
            <>
              <ShieldAlert size={18} strokeWidth={1.6} className="text-signal" />
              Chain broken at entry {broken}
            </>
          ) : (
            <>
              <ShieldCheck size={18} strokeWidth={1.6} />
              Chain verified, {audit.length} entries
            </>
          )}
        </div>
        <ol className="flex flex-col gap-2">
          {res.map((e: AuditLogEntry & { ok: boolean }) => (
            <li
              key={e.id}
              className={`rounded-2xl p-3 text-[13px] ${e.ok ? "bg-raised" : "bg-ink text-canvas"}`}
            >
              <div className="flex justify-between gap-2">
                <b>{e.actor}</b>
                <span className={e.ok ? "text-label" : "text-canvas/70"}>{e.ts}</span>
              </div>
              <div>{e.action}</div>
              <code
                className={`mt-1 block truncate text-[11px] ${e.ok ? "text-label" : "text-canvas/70"}`}
              >
                {e.prevHash.slice(0, 8)} → {e.hash.slice(0, 12)}
              </code>
            </li>
          ))}
        </ol>
        <button
          onClick={() => tamper.mutate(tamperedId ? null : Math.max(1, audit.length - 2))}
          className="btn btn-soft mt-3 w-full"
        >
          {tamperedId ? "Restore entry" : "Simulate tampering with one entry"}
        </button>
      </Card>
    </Screen>
  )
}