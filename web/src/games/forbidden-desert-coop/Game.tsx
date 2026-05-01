import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ForbiddenDesertCoopState, ForbiddenDesertCoopAction, ForbiddenDesertCoopSettings } from "./state.js";
import { ForbiddenDesertCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ForbiddenDesertCoopGame({ state, dispatch, onGameOver }: GameProps<ForbiddenDesertCoopState, ForbiddenDesertCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fbd"
      cfg={ForbiddenDesertCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ForbiddenDesertCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ForbiddenDesertCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
