import type { GameProps } from "../../platform/game-plugin/types.js";
import type { JassState, JassAction, JassSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function JassGame({ state, dispatch, onGameOver }: GameProps<JassState, JassSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as JassAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="jass"
      title="Jass"
    />
  );
}
