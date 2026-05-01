import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrenchTarotState, FrenchTarotAction, FrenchTarotSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function FrenchTarotGame({ state, dispatch, onGameOver }: GameProps<FrenchTarotState, FrenchTarotSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as FrenchTarotAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="frtarc"
      title="French Tarot"
    />
  );
}
