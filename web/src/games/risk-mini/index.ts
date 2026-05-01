import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { RiskState, RiskActionAll, RiskSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { RiskMiniGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const riskMiniPlugin: GamePlugin<RiskState, RiskActionAll, typeof settings> = {
  id: "risk-mini",
  title: "Risk Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Six-territory Risk-style world map with reinforce, attack dice, and fortify phases vs CPU.",
  howToPlay: `Risk Mini compresses the classic territory-conquest game onto a hex map of six lands: Northgate, Ironpeak, Sunhold (yours), and Marshwick, Emberwood, Stormvale (CPU). Each starts with 4 armies. Adjacency is shown by faint lines on the map.

Each turn has three phases:

1. Reinforce — You receive max(3, owned/3) armies. Click a friendly territory to place one army at a time, or hit "Auto-place & Continue" to dump the rest on the first owned territory.

2. Attack — Click one of your territories with 2+ armies, then click an adjacent enemy. Press "Roll Dice & Attack!" — you roll up to 3 dice, defender rolls up to 2. Top dice are paired off; the higher number wins each pair (ties go to the defender). Each side loses one army per lost pair. Reduce a defender to 0 to conquer the territory and move your attacking armies in. You can keep attacking until you choose to stop.

3. Fortify — Optionally move armies from one of your territories with 2+ armies to an adjacent friendly. Drag the slider to choose how many to move. Then end your turn.

The CPU then reinforces, runs greedy attacks against your weakest border territories, and play returns to you.

Win by controlling all 6 territories. After 30 turns whoever owns more territories wins. Score = 60 × territories + 4 × armies + 600 conquest bonus.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as RiskSettings),
  reducer,
  isTerminal,
  component: RiskMiniGame,
};
