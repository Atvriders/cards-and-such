import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CirullaState, CirullaAction, CirullaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function CirullaGame({ state, dispatch, onGameOver }: GameProps<CirullaState, CirullaSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as CirullaAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="cir"
      title="Cirulla"
    />
  );
}
