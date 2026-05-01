import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BaronessPatienceState, BaronessPatienceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function BaronessPatienceGame(
  props: GameProps<BaronessPatienceState, BaronessPatienceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="baroness-patience"
    />
  );
}
