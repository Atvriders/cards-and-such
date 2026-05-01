import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MagicMazePawnState, MagicMazePawnAction, MagicMazePawnSettings } from "./state.js";
import { MagicMazePawn_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MagicMazePawnGame({ state, dispatch, onGameOver }: GameProps<MagicMazePawnState, MagicMazePawnSettings>): JSX.Element {
  return (
    <CoopView
      prefix="magMzPawn"
      cfg={MagicMazePawn_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MagicMazePawnAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MagicMazePawn_CFG)}
      intro={FLAVOR}
    />
  );
}
