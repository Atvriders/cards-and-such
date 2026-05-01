import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CalabresellaState, CalabresellaAction, CalabresellaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function CalabresellaGame({ state, dispatch, onGameOver }: GameProps<CalabresellaState, CalabresellaSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as CalabresellaAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="calac"
      title="Calabresella"
    />
  );
}
