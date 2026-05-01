import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UskPatienceState, UskPatienceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function UskPatienceGame(
  props: GameProps<UskPatienceState, UskPatienceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="usk-patience"
    />
  );
}
