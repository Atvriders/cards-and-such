import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingAlbertPatState, KingAlbertPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function KingAlbertPatGame(
  props: GameProps<KingAlbertPatState, KingAlbertPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="king-albert-pat"
    />
  );
}
