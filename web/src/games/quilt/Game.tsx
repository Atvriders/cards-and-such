import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuiltState, QuiltSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function QuiltGame(
  props: GameProps<QuiltState, QuiltSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="quilt"
    />
  );
}
