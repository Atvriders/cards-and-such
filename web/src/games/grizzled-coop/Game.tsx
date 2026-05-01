import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { GrizzledCoopState, GrizzledCoopAction, GrizzledCoopSettings } from "./state.js";
import { GrizzledCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function GrizzledCoopGame({ state, dispatch, onGameOver }: GameProps<GrizzledCoopState, GrizzledCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="grz"
      cfg={GrizzledCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as GrizzledCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, GrizzledCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
