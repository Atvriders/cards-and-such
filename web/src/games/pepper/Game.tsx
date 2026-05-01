import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PepperState, PepperAction, PepperSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function PepperGame({ state, dispatch, onGameOver }: GameProps<PepperState, PepperSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as PepperAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="pepperc"
      title="Pepper"
    />
  );
}
