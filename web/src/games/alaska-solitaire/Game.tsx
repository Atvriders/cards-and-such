import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlaskaSolitaireState, AlaskaSolitaireSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AlaskaSolitaireGame(
  props: GameProps<AlaskaSolitaireState, AlaskaSolitaireSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="alaska-solitaire"
    />
  );
}
