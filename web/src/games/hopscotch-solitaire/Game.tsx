import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HopscotchSolitaireState, HopscotchSolitaireSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function HopscotchSolitaireGame(
  props: GameProps<HopscotchSolitaireState, HopscotchSolitaireSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="hopscotch-solitaire"
    />
  );
}
