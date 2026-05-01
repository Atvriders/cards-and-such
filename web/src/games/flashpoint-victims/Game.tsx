import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { FlashpointVictimsState, FlashpointVictimsAction, FlashpointVictimsSettings } from "./state.js";
import { FlashpointVictims_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function FlashpointVictimsGame({ state, dispatch, onGameOver }: GameProps<FlashpointVictimsState, FlashpointVictimsSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fpv"
      cfg={FlashpointVictims_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as FlashpointVictimsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, FlashpointVictims_CFG)}
      intro={FLAVOR}
    />
  );
}
