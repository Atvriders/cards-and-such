import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ForbiddenIslandCoopState, ForbiddenIslandCoopAction, ForbiddenIslandCoopSettings } from "./state.js";
import { ForbiddenIslandCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ForbiddenIslandCoopGame({ state, dispatch, onGameOver }: GameProps<ForbiddenIslandCoopState, ForbiddenIslandCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fbi"
      cfg={ForbiddenIslandCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ForbiddenIslandCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ForbiddenIslandCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
