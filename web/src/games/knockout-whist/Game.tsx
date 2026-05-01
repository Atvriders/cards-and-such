import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockoutWhistState, KnockoutWhistAction, KnockoutWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function KnockoutWhistGame({ state, dispatch, onGameOver }: GameProps<KnockoutWhistState, KnockoutWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as KnockoutWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="kowh"
      title="Knockout Whist"
    />
  );
}
