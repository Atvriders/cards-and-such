import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscoloneState, BriscoloneAction, BriscoloneSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BriscoloneGame({ state, dispatch, onGameOver }: GameProps<BriscoloneState, BriscoloneSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BriscoloneAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bris-l"
      title="Briscolone"
    />
  );
}
