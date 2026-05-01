import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoincheState, CoincheAction, CoincheSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function CoincheGame({ state, dispatch, onGameOver }: GameProps<CoincheState, CoincheSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as CoincheAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="coincc"
      title="Coinche"
    />
  );
}
