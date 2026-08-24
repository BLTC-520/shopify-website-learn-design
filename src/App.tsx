import { useEffect, useState } from "react"
import { Leva } from "leva"
import { CanvasRoot } from "./scene/CanvasRoot"
import { CanvasGuard } from "./overlay/CanvasGuard"
import { DeveloperType } from "./overlay/DeveloperType"
import { PaperGrain } from "./overlay/PaperGrain"
import { useExperience } from "./store/experience"
import { bootTheatreStudio } from "./theatre/sheet"
import { textureUrl } from "./lib/assets"

export default function App() {
  const webglOk = useExperience((s) => s.webglOk)
  const hydrate = useExperience((s) => s.hydrate)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    hydrate()
    if (new URLSearchParams(window.location.search).has("studio")) {
      bootTheatreStudio()
    }
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [hydrate])

  const reducedMotion = useExperience((s) => s.reducedMotion)

  return (
    <section
      id="developer"
      className={reducedMotion ? "is-reduced" : undefined}
    >
      <div className="stage">
        <Leva
          hidden={!import.meta.env.DEV || narrow}
          collapsed
          oneLineLabels
        />
        {webglOk ? (
          <CanvasGuard>
            <CanvasRoot />
          </CanvasGuard>
        ) : (
          <div className="fallback-stage">
            <img src={textureUrl("/textures/bust.jpg")} alt="" />
          </div>
        )}
        <DeveloperType />
      </div>
      <PaperGrain />
    </section>
  )
}
