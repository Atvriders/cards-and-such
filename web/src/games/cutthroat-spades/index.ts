import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CutthroatSpadesState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CutthroatSpades } from "./CutthroatSpades.js";

const cutthroatSpadesSettings = {} as const;
type CutthroatSpadesSettings = SettingsOf<typeof cutthroatSpadesSettings>;
type CutthroatSpadesAction = { type: "play"; cardId: string };

export const cutthroatSpadesPlugin: GamePlugin<CutthroatSpadesState, CutthroatSpadesAction, typeof cutthroatSpadesSettings> = {
  id: "cutthroat-spades",
  title: "Cutthroat Spades",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Spades simplified to a one-on-one duel — spades are trump.",
  howToPlay: `Cutthroat Spades is the no-partners variant of Spades. In this one-on-one version you and the bot each get 13 cards from a 52-card deck and play 13 tricks. Spades are always trump. The leader plays any card; the follower must follow the led suit if able — if void in the led suit, they may play any card including a spade. Highest spade wins; if no spade is played, highest of the led suit wins. Click cards to play. Score is the number of tricks you win. Strategy: count spades carefully, save your highest for late tricks, and try to make the bot void itself by leading long side suits. The deal is determined by the seed, so the same seed reproduces the same hand for replay analysis. Win at least 7 out of 13 tricks to claim victory.`,
  settings: cutthroatSpadesSettings,
  initialState: (seed: number, _settings: CutthroatSpadesSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-cutthroat-spades-hand"]', pulses: 3 };
      return null;
    },
  component: CutthroatSpades,
};
