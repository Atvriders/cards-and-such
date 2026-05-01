import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HarpPatienceState, HarpPatienceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function HarpPatienceGame(
  props: GameProps<HarpPatienceState, HarpPatienceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="harp-patience"
    />
  );
}
