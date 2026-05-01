import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SchieberJassState, SchieberJassAction, SchieberJassSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function SchieberJassGame({ state, dispatch, onGameOver }: GameProps<SchieberJassState, SchieberJassSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as SchieberJassAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="schjc"
      title="Schieber Jass"
    />
  );
}
