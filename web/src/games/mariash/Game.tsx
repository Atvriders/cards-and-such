import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MariashState, MariashAction, MariashSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function MariashGame({ state, dispatch, onGameOver }: GameProps<MariashState, MariashSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as MariashAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="mariac"
      title="Mariáš"
    />
  );
}
