import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniCanfieldState, MiniCanfieldSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MiniCanfieldGame(
  props: GameProps<MiniCanfieldState, MiniCanfieldSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="mini-canfield"
    />
  );
}
