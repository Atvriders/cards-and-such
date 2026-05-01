import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WaspPatState, WaspPatSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function WaspPatGame(
  props: GameProps<WaspPatState, WaspPatSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="wasp-pat"
    />
  );
}
