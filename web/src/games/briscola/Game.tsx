import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaState, BriscolaAction, BriscolaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BriscolaGame({ state, dispatch, onGameOver }: GameProps<BriscolaState, BriscolaSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BriscolaAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bris"
      title="Briscola"
    />
  );
}
