import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuchessPatState, DuchessPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function DuchessPatGame(
  props: GameProps<DuchessPatState, DuchessPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="duchess-pat"
    />
  );
}
