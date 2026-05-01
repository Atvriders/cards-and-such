import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GermanWhistState, GermanWhistAction, GermanWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function GermanWhistGame({ state, dispatch, onGameOver }: GameProps<GermanWhistState, GermanWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as GermanWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="gerwh"
      title="German Whist"
    />
  );
}
