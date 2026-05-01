import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SultanSolitaireState, SultanSolitaireSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SultanSolitaireGame(
  props: GameProps<SultanSolitaireState, SultanSolitaireSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="sultan-solitaire"
    />
  );
}
