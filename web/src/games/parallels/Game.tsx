import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParallelsState, ParallelsSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function ParallelsGame(
  props: GameProps<ParallelsState, ParallelsSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="parallels"
    />
  );
}
