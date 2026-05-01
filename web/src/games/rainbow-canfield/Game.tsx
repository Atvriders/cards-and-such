import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RainbowCanfieldState, RainbowCanfieldSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function RainbowCanfieldGame(
  props: GameProps<RainbowCanfieldState, RainbowCanfieldSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="rainbow-canfield"
    />
  );
}
