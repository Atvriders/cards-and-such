import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuadrupleAlliancePatState, QuadrupleAlliancePatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function QuadrupleAlliancePatGame(
  props: GameProps<QuadrupleAlliancePatState, QuadrupleAlliancePatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="quadruple-alliance-pat"
    />
  );
}
