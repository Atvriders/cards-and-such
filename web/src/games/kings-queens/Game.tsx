import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsQueensState, KingsQueensSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function KingsQueensGame(
  props: GameProps<KingsQueensState, KingsQueensSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="kings-queens"
    />
  );
}
