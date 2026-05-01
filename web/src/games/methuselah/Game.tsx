import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MethuselahState, MethuselahSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MethuselahGame(
  props: GameProps<MethuselahState, MethuselahSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="methuselah"
    />
  );
}
