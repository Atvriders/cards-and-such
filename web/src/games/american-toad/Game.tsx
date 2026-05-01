import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AmericanToadState, AmericanToadSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function AmericanToadGame(
  props: GameProps<AmericanToadState, AmericanToadSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="american-toad"
    />
  );
}
