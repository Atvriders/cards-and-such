import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { RobinsonCrusoeCoopState, RobinsonCrusoeCoopAction, RobinsonCrusoeCoopSettings } from "./state.js";
import { RobinsonCrusoeCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function RobinsonCrusoeCoopGame({ state, dispatch, onGameOver }: GameProps<RobinsonCrusoeCoopState, RobinsonCrusoeCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="rcc"
      cfg={RobinsonCrusoeCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as RobinsonCrusoeCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, RobinsonCrusoeCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
