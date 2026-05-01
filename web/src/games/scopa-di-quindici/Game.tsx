import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScopaDiQuindiciState, ScopaDiQuindiciAction, ScopaDiQuindiciSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function ScopaDiQuindiciGame({ state, dispatch, onGameOver }: GameProps<ScopaDiQuindiciState, ScopaDiQuindiciSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as ScopaDiQuindiciAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="sq15"
      title="Scopa di Quindici"
    />
  );
}
