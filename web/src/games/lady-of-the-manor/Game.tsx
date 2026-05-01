import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LadyOfTheManorState, LadyOfTheManorSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function LadyOfTheManorGame(
  props: GameProps<LadyOfTheManorState, LadyOfTheManorSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="lady-of-the-manor"
    />
  );
}
