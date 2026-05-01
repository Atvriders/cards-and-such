import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BigHarpState, BigHarpSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function BigHarpGame(
  props: GameProps<BigHarpState, BigHarpSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="big-harp"
    />
  );
}
