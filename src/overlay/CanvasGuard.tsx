import { Component, type ReactNode } from "react"

type Props = { children: ReactNode }
type State = { failed: boolean }

export class CanvasGuard extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="fallback-stage">
          <img src="/textures/bust.jpg" alt="" />
        </div>
      )
    }
    return this.props.children
  }
}
