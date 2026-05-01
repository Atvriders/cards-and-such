import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrescentSolitaireState, CrescentSolitaireSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function CrescentSolitaireGame(
  props: GameProps<CrescentSolitaireState, CrescentSolitaireSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="crescent-solitaire"
    />
  );
}
