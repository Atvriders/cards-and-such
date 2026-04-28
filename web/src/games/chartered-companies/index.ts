import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CharteredCompaniesState, CharteredCompaniesAction, CharteredCompaniesSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CharteredCompaniesGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const charteredCompaniesPlugin: GamePlugin<CharteredCompaniesState, CharteredCompaniesAction, typeof settings> = {
  id: "chartered-companies",
  title: "Chartered Companies",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "18xx-lite chartered company stock game. Fast play format.",
  howToPlay: "Chartered Companies is a ten-turn 18xx-lite stock game inspired by Chartered: The Golden Age. You start with $200 cash. Each turn pick: Invest $60 (one Charter share), Save (5% interest), Hire a Director for $100, or Trade a Charter for a $30-50 stock-market sale. After actions, each Charter pays $16 chartered-company dividend and each Director earns $24 in board-fees. Mid-screen flavor describes corporate maneuvering: IPOs, mergers, dividends. Score equals net worth at turn 10. The economics: Charters return 27%, Directors return 24%, saving is 5%. High-cost assets mean the early game requires careful saving, you can't even afford a Charter on turn 1's $200. Strong runs reach $700-900 with 3-4 Charters plus 1 Director. Aggressive play that runs out of cash fizzles. Aim for steady ramping, with 1-2 Charters by turn 4 and Director by turn 7.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CharteredCompaniesSettings),
  reducer,
  isTerminal,
  component: CharteredCompaniesGame,
};
