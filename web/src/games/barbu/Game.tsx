import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BarbuState, BarbuAction, BarbuSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BarbuGame({ state, dispatch, onGameOver }: GameProps<BarbuState, BarbuSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BarbuAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="barb"
      title="Barbu"
    />
  );
}
