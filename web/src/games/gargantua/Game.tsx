import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GargantuaState, GargantuaSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function GargantuaGame(
  props: GameProps<GargantuaState, GargantuaSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="gargantua"
    />
  );
}
