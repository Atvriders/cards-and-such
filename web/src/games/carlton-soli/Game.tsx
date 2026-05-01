import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarltonSoliState, CarltonSoliSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function CarltonSoliGame(
  props: GameProps<CarltonSoliState, CarltonSoliSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="carlton-soli"
    />
  );
}
