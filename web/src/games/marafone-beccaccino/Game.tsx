import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarafoneState, MarafoneAction, MarafoneSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function MarafoneGame({ state, dispatch, onGameOver }: GameProps<MarafoneState, MarafoneSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as MarafoneAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="maraf"
      title="Marafone (Beccaccino)"
    />
  );
}
