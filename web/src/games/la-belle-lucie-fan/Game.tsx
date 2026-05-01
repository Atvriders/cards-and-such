import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LaBelleLucieFanState, LaBelleLucieFanSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function LaBelleLucieFanGame(
  props: GameProps<LaBelleLucieFanState, LaBelleLucieFanSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="la-belle-lucie-fan"
    />
  );
}
