import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThreeShufflesAndADrawState, ThreeShufflesAndADrawSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function ThreeShufflesAndADrawGame(
  props: GameProps<ThreeShufflesAndADrawState, ThreeShufflesAndADrawSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="three-shuffles-and-a-draw"
    />
  );
}
