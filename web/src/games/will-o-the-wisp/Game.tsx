import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WillOTheWispState, WillOTheWispSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function WillOTheWispGame(
  props: GameProps<WillOTheWispState, WillOTheWispSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="will-o-the-wisp"
    />
  );
}
