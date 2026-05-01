import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapState, NapAction, NapSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function NapGame({ state, dispatch, onGameOver }: GameProps<NapState, NapSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as NapAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="nap"
      title="Napoleon (Nap)"
    />
  );
}
