import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WillOWispState, WillOWispSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function WillOWispGame(
  props: GameProps<WillOWispState, WillOWispSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="will-o-wisp"
    />
  );
}
