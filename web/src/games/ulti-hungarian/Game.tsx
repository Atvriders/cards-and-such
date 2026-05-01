import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UltiHungarianState, UltiHungarianAction, UltiHungarianSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function UltiHungarianGame({ state, dispatch, onGameOver }: GameProps<UltiHungarianState, UltiHungarianSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as UltiHungarianAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="ulti"
      title="Ulti"
    />
  );
}
