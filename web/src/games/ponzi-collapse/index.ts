import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PonziCollapseState, PonziCollapseAction, PonziCollapseSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PonziCollapseGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const ponziCollapsePlugin: GamePlugin<PonziCollapseState, PonziCollapseAction, typeof settings> = {
  id: "ponzi-collapse",
  title: "Ponzi Collapse",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Borrow to pay old investors. Don't be the last one holding.",
  howToPlay: "Ponzi Collapse turns the classic financial-bluffing game into a ten-turn solo simulation. You start with $200 cash. Each turn pick: Invest $40 to bring in a new Investor, Save (5% interest, the safe-deposit option), Hire a Recruiter for $70 to scale signup, or Trade an Investor (cash out a chunk) for $30-50. After actions, each Investor pays $10 in fresh capital flowing in and each Recruiter earns $16 from new sign-up commissions. The flavor describes the looming collapse: regulators sniffing, panic withdrawals, the SEC. Score equals net worth on turn 10. The dynamics: Investors return 25% on basis; Recruiters return 23%. Pure save runs reach $325; balanced engine runs $700+. The trick: as the scheme grows, dividends compound. But trade out aggressively in mid-game to lock profits before flavor events suggest collapse. Aim for $700-850.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PonziCollapseSettings),
  reducer,
  isTerminal,
  hint: (state: PonziCollapseState): HintTarget | null => (state.phase === "choosing" ? { selector: '[data-testid="hint-target-ponzi-collapse-primary"]', pulses: 3 } : null),
  component: PonziCollapseGame,
};
