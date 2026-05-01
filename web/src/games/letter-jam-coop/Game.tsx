import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { LetterJamCoopState, LetterJamCoopAction, LetterJamCoopSettings } from "./state.js";
import { LetterJamCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LetterJamCoopGame({ state, dispatch, onGameOver }: GameProps<LetterJamCoopState, LetterJamCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="letJmCoop"
      cfg={LetterJamCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as LetterJamCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, LetterJamCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
