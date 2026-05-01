import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoloWhistState, SoloWhistAction, SoloWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function SoloWhistGame({ state, dispatch, onGameOver }: GameProps<SoloWhistState, SoloWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as SoloWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="solowh"
      title="Solo Whist"
    />
  );
}
