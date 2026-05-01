import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TressetteNonPrendereState, TressetteNonPrendereAction, TressetteNonPrendereSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TressetteNonPrendereGame({ state, dispatch, onGameOver }: GameProps<TressetteNonPrendereState, TressetteNonPrendereSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TressetteNonPrendereAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="trenpc"
      title="Tressette Non Prendere"
    />
  );
}
