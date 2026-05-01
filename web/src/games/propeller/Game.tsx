import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PropellerState, PropellerSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function PropellerGame(
  props: GameProps<PropellerState, PropellerSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="propeller"
    />
  );
}
