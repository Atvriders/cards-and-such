import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SixtySixState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SixtySix } from "./SixtySix.js";

const sixtySixSettings = {} as const;
type SixtySixSettings = SettingsOf<typeof sixtySixSettings>;
type SixtySixAction = { type: "play"; cardId: string };

export const sixtySixPlugin: GamePlugin<SixtySixState, SixtySixAction, typeof sixtySixSettings> = {
  id: "sixty-six",
  title: "Sixty-Six",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German 24-card two-player trick game — set-trump duel here.",
  howToPlay: `Sixty-Six (Sechsundsechzig) is a classic German two-player trick-taking game on a 24-card pack. This simplified duel uses a 24-card pack (9, 10, J, Q, K, A in each suit) with hearts as trump. You and the bot each receive 6 cards. Each trick: follow the led suit if able, otherwise play any card. Highest heart wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in true Sixty-Six, captured cards score points and you must reach 66 to win, with marriages and the trump 9 (Trumpfsau) earning bonuses. This version simplifies to a pure trick count: capture 4 of 6 tricks to win. Lead long side suits to draw the bot’s hearts, then cash your trumps and side-suit aces.`,
  settings: sixtySixSettings,
  initialState: (seed: number, _settings: SixtySixSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-sixty-six-hand"]', pulses: 3 };
      return null;
    },
  component: SixtySix,
};
