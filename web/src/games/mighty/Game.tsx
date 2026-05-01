import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MightyState, MightyAction, MightySettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function MightyGame({ state, dispatch, onGameOver }: GameProps<MightyState, MightySettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as MightyAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="mty"
      title="Mighty"
    />
  );
}
