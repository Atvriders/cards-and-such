import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PitchState, PitchAction, PitchSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function PitchGame({ state, dispatch, onGameOver }: GameProps<PitchState, PitchSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as PitchAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="pitchc"
      title="Pitch"
    />
  );
}
