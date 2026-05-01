import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlackWidowState, BlackWidowSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function BlackWidowGame(
  props: GameProps<BlackWidowState, BlackWidowSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="black-widow"
    />
  );
}
