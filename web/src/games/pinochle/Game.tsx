import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PinochleState, PinochleAction, PinochleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function PinochleGame({ state, dispatch, onGameOver }: GameProps<PinochleState, PinochleSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as PinochleAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="pinc"
      title="Pinochle"
    />
  );
}
