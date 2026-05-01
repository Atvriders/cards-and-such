import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuiltPatState, QuiltPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function QuiltPatGame(
  props: GameProps<QuiltPatState, QuiltPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="quilt-pat"
    />
  );
}
