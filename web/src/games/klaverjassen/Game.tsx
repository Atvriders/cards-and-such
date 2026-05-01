import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlaverjassenState, KlaverjassenAction, KlaverjassenSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function KlaverjassenGame({ state, dispatch, onGameOver }: GameProps<KlaverjassenState, KlaverjassenSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as KlaverjassenAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="klav"
      title="Klaverjassen"
    />
  );
}
