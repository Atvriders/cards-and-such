import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StonewallState, StonewallSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function StonewallGame(
  props: GameProps<StonewallState, StonewallSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="stonewall"
    />
  );
}
