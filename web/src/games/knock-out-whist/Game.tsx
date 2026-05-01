import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockOutWhistState, KnockOutWhistAction, KnockOutWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function KnockOutWhistGame({ state, dispatch, onGameOver }: GameProps<KnockOutWhistState, KnockOutWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as KnockOutWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="ko2-wh"
      title="Knock Out Whist"
    />
  );
}
