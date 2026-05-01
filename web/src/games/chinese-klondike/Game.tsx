import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChineseKlondikeState, ChineseKlondikeSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function ChineseKlondikeGame(
  props: GameProps<ChineseKlondikeState, ChineseKlondikeSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="chinese-klondike"
    />
  );
}
