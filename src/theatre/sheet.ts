export function bootTheatreStudio() {
  if (!import.meta.env.DEV) return
  void Promise.all([import("@theatre/studio"), import("@theatre/core")]).then(
    ([studio, core]) => {
      studio.default.initialize()
      core.getProject("Developer")
    },
  )
}
