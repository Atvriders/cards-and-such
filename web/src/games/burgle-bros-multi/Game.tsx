import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { BurgleBrosMultiState, BurgleBrosMultiAction, BurgleBrosMultiSettings } from "./state.js";
import { BurgleBrosMulti_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function BurgleBrosMultiGame({ state, dispatch, onGameOver }: GameProps<BurgleBrosMultiState, BurgleBrosMultiSettings>): JSX.Element {
  return (
    <CoopView
      prefix="bbm"
      cfg={BurgleBrosMulti_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as BurgleBrosMultiAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, BurgleBrosMulti_CFG)}
      intro={FLAVOR}
    />
  );
}
