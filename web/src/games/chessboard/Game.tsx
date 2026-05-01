import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChessboardState, ChessboardSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function ChessboardGame(
  props: GameProps<ChessboardState, ChessboardSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="chessboard"
    />
  );
}
