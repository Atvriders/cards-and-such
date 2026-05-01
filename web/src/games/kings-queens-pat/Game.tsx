import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsQueensPatState, KingsQueensPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function KingsQueensPatGame(
  props: GameProps<KingsQueensPatState, KingsQueensPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="kings-queens-pat"
    />
  );
}
