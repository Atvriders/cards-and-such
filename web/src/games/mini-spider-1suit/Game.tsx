import { SolitaireFamilyView } from "../_shared/SolitaireFamilyView.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniSpider1suitState, MiniSpider1suitSettings } from "./state.js";
import { cfg, ruleset } from "./state.js";
import "./Game.css";

export function MiniSpider1suitGame(
  props: GameProps<MiniSpider1suitState, MiniSpider1suitSettings>,
): JSX.Element {
  return (
    <SolitaireFamilyView
      {...props}
      cfg={cfg}
      ruleset={ruleset}
      prefix="mini-spider-1suit"
    />
  );
}
