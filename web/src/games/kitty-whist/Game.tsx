import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KittyWhistState, KittyWhistAction, KittyWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function KittyWhistGame({ state, dispatch, onGameOver }: GameProps<KittyWhistState, KittyWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as KittyWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="kitwh"
      title="Kitty Whist"
    />
  );
}
