import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DifferenzlerJassState, DifferenzlerJassAction, DifferenzlerJassSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function DifferenzlerJassGame({ state, dispatch, onGameOver }: GameProps<DifferenzlerJassState, DifferenzlerJassSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as DifferenzlerJassAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="difjc"
      title="Differenzler Jass"
    />
  );
}
