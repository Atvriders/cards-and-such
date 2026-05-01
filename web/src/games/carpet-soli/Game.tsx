import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CarpetSoliState, CarpetSoliSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function CarpetSoliGame(
  props: GameProps<CarpetSoliState, CarpetSoliSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="carpet-soli"
    />
  );
}
