import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ForbiddenJungleCoopState, ForbiddenJungleCoopAction, ForbiddenJungleCoopSettings } from "./state.js";
import { ForbiddenJungleCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ForbiddenJungleCoopGame({ state, dispatch, onGameOver }: GameProps<ForbiddenJungleCoopState, ForbiddenJungleCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fbj"
      cfg={ForbiddenJungleCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ForbiddenJungleCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ForbiddenJungleCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
