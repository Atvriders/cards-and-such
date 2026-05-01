import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChibreState, ChibreAction, ChibreSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function ChibreGame({ state, dispatch, onGameOver }: GameProps<ChibreState, ChibreSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as ChibreAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="chib"
      title="Chibre"
    />
  );
}
