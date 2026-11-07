import { useEffect, useState } from "react"
import { Screen } from "../components/Layout"
import { Card, Title } from "../components/ui"
import { useApp } from "../store/useApp"
import { idbClear, idbCount } from "../store/persist"
import { useConnection } from "../api/hooks"

export default function Settings() {
  const { state, queue } = useConnection()
  const simOffline = useApp((s) => s.flags.co2Event)
  const toggleOffline = () => useApp.getState().setFlag("co2Event", !useApp.getState().flags.co2Event)
  const [n, setN] = useState(0)
  const [sw, setSw] = useState("checking")
  useEffect(() => {
    idbCount().then(setN)
    navigator.serviceWorker
      ?.getRegistration()
      .then((r) => setSw(r ? "active" : "not registered in dev")) ??
      setSw("unsupported")
  }, [])
  return (
    <Screen>
      <Title a="Settings" b="& Storage" />
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[16px] font-semibold">Simulate offline</div>
            <div className="text-[13px] text-label">
              Link is {state}. Queued items: {queue}.
            </div>
          </div>
          <button
            role="switch"
            aria-checked={simOffline}
            aria-label="Simulate offline"
            onClick={toggleOffline}
            className={`h-8 w-14 shrink-0 rounded-full p-1 transition-colors ${
              simOffline ? "bg-ink" : "bg-black/15"
            }`}
          >
            <span
              className={`block size-6 rounded-full bg-white transition-transform ${
                simOffline ? "translate-x-6" : ""
              }`}
            />
          </button>
        </div>
      </Card>
      <Card className="flex flex-col gap-2 p-5 text-[14.5px]">
        <div className="flex justify-between">
          <span>Service worker</span>
          <b>{sw}</b>
        </div>
        <div className="flex justify-between">
          <span>Local records (IndexedDB)</span>
          <b>{n}</b>
        </div>
        <button
          className="btn btn-soft mt-2"
          onClick={async () => {
            await idbClear()
            setN(0)
          }}
        >
          Clear local data
        </button>
      </Card>
      <p className="text-[13px] text-label">
        VITASTRA 1.0. Decision support only.
      </p>
    </Screen>
  )
}