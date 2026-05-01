import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpidikeState, SpidikeSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function SpidikeGame(
  props: GameProps<SpidikeState, SpidikeSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="spidike"
    />
  );
}
