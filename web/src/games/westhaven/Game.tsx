import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WesthavenState, WesthavenSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function WesthavenGame(
  props: GameProps<WesthavenState, WesthavenSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="westhaven"
    />
  );
}
