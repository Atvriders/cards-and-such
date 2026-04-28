import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RiskState, RiskAction, RiskSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RiskMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const riskMiniPlugin: GamePlugin<RiskState, RiskAction, typeof settings> = {
  id: "risk-mini",
  title: "Risk Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "5 territories, simplified Risk-style attack-and-conquer vs CPU.",
  howToPlay: `Risk Mini compresses the 1957 territory-conquest classic onto five named territories: Alpha, Bravo, Charlie, Delta, Echo. You start owning Alpha, Bravo, and Charlie with smaller armies; the CPU owns Delta and Echo with bigger ones.

How to play:
1. Click one of YOUR territories (must have at least 2 armies) to choose an attacker.
2. Click a CPU territory to make it your target. The phase changes to "Resolve".
3. Press Attack! Both sides roll dice (you up to 3, defender up to 2). Highest dice are paired off; for each pair the higher number wins, ties go to the defender. Each side loses one army per lost pair.
4. If the defender drops to 0, you conquer the territory and move armies in.
5. Press CPU Turn — the CPU mirror-attacks your weakest territory with its strongest, then both sides reinforce one random owned territory by +1 army.

You can press End Turn before attacking if you'd rather defend. The game ends when one side controls all 5 territories, or after 30 turns whoever owns most wins.

Score = 50 × territories owned + 5 × armies + a 500 conquest bonus.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RiskSettings),
  reducer,
  isTerminal,
  component: RiskMiniGame,
};
