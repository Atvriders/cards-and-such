import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlorentineSoliState, FlorentineSoliSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function FlorentineSoliGame(
  props: GameProps<FlorentineSoliState, FlorentineSoliSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="florentine-soli"
    />
  );
}
