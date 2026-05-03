import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MarafoneState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { Marafone } from "./Marafone.js";

const marafoneSettings = {} as const;
type MarafoneSettings = SettingsOf<typeof marafoneSettings>;
type MarafoneAction = { type: "play"; cardId: string };

export const marafonePlugin: GamePlugin<MarafoneState, MarafoneAction, typeof marafoneSettings> = {
  id: "marafone",
  title: "Marafone",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Romagnan trick-taking game on 40 cards — set-trump duel here.",
  howToPlay: `Marafone (also Beccaccino) is a Romagnan partnership trick-taking game on the 40-card Italian deck. This 1v1 simplification uses spades as trump and a single round. You and the bot each receive 10 cards from the Italian pack (A, 2, 3, 4, 5, 6, 7, J, Q, K in each suit). Each trick: follow the led suit if able, otherwise play any card. Highest spade wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: in Marafone the 3 is the highest pip card after the Ace, a quirk we do not implement — here Ace is high, then K, Q, J, 7, 6, etc. Lead long side suits to flush trumps, then run your remaining spades. Capture 6 of 10 tricks to win the duel.`,
  settings: marafoneSettings,
  initialState: (seed: number, _settings: MarafoneSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-marafone-hand"]', pulses: 3 };
      return null;
    },
  component: Marafone,
};
