import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MadrassoTrickState, MadrassoTrickAction, MadrassoTrickSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function MadrassoTrickGame({ state, dispatch, onGameOver }: GameProps<MadrassoTrickState, MadrassoTrickSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as MadrassoTrickAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="madr"
      title="Madrasso"
    />
  );
}
