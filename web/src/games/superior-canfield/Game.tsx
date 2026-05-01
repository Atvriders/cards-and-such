import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuperiorCanfieldState, SuperiorCanfieldSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SuperiorCanfieldGame(
  props: GameProps<SuperiorCanfieldState, SuperiorCanfieldSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="superior-canfield"
    />
  );
}
