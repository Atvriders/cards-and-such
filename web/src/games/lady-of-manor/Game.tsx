import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LadyOfManorState, LadyOfManorSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function LadyOfManorGame(
  props: GameProps<LadyOfManorState, LadyOfManorSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="lady-of-manor"
    />
  );
}
