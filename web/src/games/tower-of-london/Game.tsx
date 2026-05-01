import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TowerOfLondonState, TowerOfLondonSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function TowerOfLondonGame(
  props: GameProps<TowerOfLondonState, TowerOfLondonSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="tower-of-london"
    />
  );
}
