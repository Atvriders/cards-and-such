import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuchessLuynesState, DuchessLuynesSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function DuchessLuynesGame(
  props: GameProps<DuchessLuynesState, DuchessLuynesSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="duchess-luynes"
    />
  );
}
