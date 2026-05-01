import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonsShoulderState, NapoleonsShoulderSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function NapoleonsShoulderGame(
  props: GameProps<NapoleonsShoulderState, NapoleonsShoulderSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="napoleons-shoulder"
    />
  );
}
