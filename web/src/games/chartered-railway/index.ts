import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CharteredRailwayState, CharteredRailwayAction, CharteredRailwaySettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CharteredRailwayGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const charteredRailwayPlugin: GamePlugin<CharteredRailwayState, CharteredRailwayAction, typeof settings> = {
  id: "chartered-railway",
  title: "Chartered Railway",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "18xx-lite railway stock variant — fast play format.",
  howToPlay: "Chartered Railway is an 18xx-lite stock-game distillation across ten turns. You start with $250 cash, no Charter shares, and no Locomotives. Each turn, pick one action: Buy a Charter for $45, Save your cash for 5% interest, Buy a Locomotive for $65, or Sell a Charter for $35-55.\n\nAfter your action, every Charter earns $9 in dividends and every Locomotive earns $13 in route revenue. A track-laying flavor event affects the round. Your final score is net worth — cash plus cost-basis value of charters and locos. The 18xx genre rewards careful capital allocation; this version compresses the scale into a quick ten-turn arc. Watch the share price. Build the network. Cash out at the right moment.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CharteredRailwaySettings),
  reducer,
  isTerminal,
  hint: (state: any) => {
    if (state.phase === "choosing") return { selector: '[data-testid="hint-target-chartered-railway-primary"]', pulses: 3 };
    if (state.phase === "resolved") return { selector: '[data-testid="hint-target-chartered-railway-next"]', pulses: 3 };
    return null;
  },
  component: CharteredRailwayGame,
};
