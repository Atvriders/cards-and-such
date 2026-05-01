import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NineAcrossState, NineAcrossSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function NineAcrossGame(
  props: GameProps<NineAcrossState, NineAcrossSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="nine-across"
    />
  );
}
