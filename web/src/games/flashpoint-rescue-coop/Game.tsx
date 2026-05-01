import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { FlashpointRescueCoopState, FlashpointRescueCoopAction, FlashpointRescueCoopSettings } from "./state.js";
import { FlashpointRescueCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function FlashpointRescueCoopGame({ state, dispatch, onGameOver }: GameProps<FlashpointRescueCoopState, FlashpointRescueCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fpr"
      cfg={FlashpointRescueCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as FlashpointRescueCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, FlashpointRescueCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
