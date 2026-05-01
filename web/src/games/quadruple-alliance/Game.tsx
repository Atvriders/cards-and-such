import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuadrupleAllianceState, QuadrupleAllianceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function QuadrupleAllianceGame(
  props: GameProps<QuadrupleAllianceState, QuadrupleAllianceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="quadruple-alliance"
    />
  );
}
