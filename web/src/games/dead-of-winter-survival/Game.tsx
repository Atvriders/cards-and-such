import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DeadOfWinterSurvivalState, DeadOfWinterSurvivalAction, DeadOfWinterSurvivalSettings } from "./state.js";
import { DeadOfWinterSurvival_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DeadOfWinterSurvivalGame({ state, dispatch, onGameOver }: GameProps<DeadOfWinterSurvivalState, DeadOfWinterSurvivalSettings>): JSX.Element {
  return (
    <CoopView
      prefix="dowSurviv"
      cfg={DeadOfWinterSurvival_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DeadOfWinterSurvivalAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DeadOfWinterSurvival_CFG)}
      intro={FLAVOR}
    />
  );
}
