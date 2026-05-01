import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BouquetState, BouquetSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function BouquetGame(
  props: GameProps<BouquetState, BouquetSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="bouquet"
    />
  );
}
