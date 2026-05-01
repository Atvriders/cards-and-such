import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonsSquareState, NapoleonsSquareSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function NapoleonsSquareGame(
  props: GameProps<NapoleonsSquareState, NapoleonsSquareSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="napoleons-square"
    />
  );
}
