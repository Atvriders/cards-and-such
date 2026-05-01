import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MatrimonyPatienceState, MatrimonyPatienceSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MatrimonyPatienceGame(
  props: GameProps<MatrimonyPatienceState, MatrimonyPatienceSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="matrimony-patience"
    />
  );
}
