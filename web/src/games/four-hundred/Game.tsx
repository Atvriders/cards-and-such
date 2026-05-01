import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourHundredState, FourHundredAction, FourHundredSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function FourHundredGame({ state, dispatch, onGameOver }: GameProps<FourHundredState, FourHundredSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as FourHundredAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="f400"
      title="Four Hundred"
    />
  );
}
