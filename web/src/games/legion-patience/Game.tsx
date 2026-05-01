import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LegionPatienceState, LegionPatienceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function LegionPatienceGame(
  props: GameProps<LegionPatienceState, LegionPatienceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="legion-patience"
    />
  );
}
