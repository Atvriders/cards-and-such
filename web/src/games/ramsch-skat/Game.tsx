import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RamschSkatState, RamschSkatAction, RamschSkatSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function RamschSkatGame({ state, dispatch, onGameOver }: GameProps<RamschSkatState, RamschSkatSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as RamschSkatAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="ram-s"
      title="Ramsch (Skat)"
    />
  );
}
