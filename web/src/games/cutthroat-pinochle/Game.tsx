import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CutthroatPinochleState, CutthroatPinochleAction, CutthroatPinochleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function CutthroatPinochleGame({ state, dispatch, onGameOver }: GameProps<CutthroatPinochleState, CutthroatPinochleSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as CutthroatPinochleAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="cut-pin"
      title="Cutthroat Pinochle"
    />
  );
}
