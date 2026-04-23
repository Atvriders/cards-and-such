import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { DoubleDummyWhistState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DoubleDummyWhist } from "./DoubleDummyWhist.js";

export const doubleDummyWhistSettings = {} as const;

type DDWSettingsType = SettingsOf<typeof doubleDummyWhistSettings>;
type DDWAction = { type: "play"; cardId: string };

export const doubleDummyWhistPlugin: GamePlugin<DoubleDummyWhistState, DDWAction, typeof doubleDummyWhistSettings> = {
  id: "double-dummy-whist",
  title: "Double Dummy Whist",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "2-player whist with all 4 hands visible. Control your hand and a dummy. Full information strategy!",
  howToPlay: `Double Dummy Whist is a variant of whist where all four hands are dealt face-up and visible to everyone — making it a pure strategy game with no hidden information.

Setup: 52 cards are dealt 13 each to four seats. A trump suit is chosen randomly. The four seats form two partnerships: Seats 0 & 2 (your team) versus Seats 1 & 3 (bot team). You control both Seats 0 and 2; the bot controls Seats 1 and 3.

Play: The standard trick-taking rules apply. You must follow the led suit if possible. If you cannot follow suit you may play any card. The highest trump wins the trick; otherwise the highest card of the led suit wins. The trick winner leads next.

Your control: When it is Seat 0's turn you play for Seat 0. When it is Seat 2's turn (your dummy) you play for Seat 2. The bot automatically plays for Seats 1 and 3.

Scoring: The team with more tricks wins (score 100 for you, 0 for bot). A tie scores 50.

Strategy: Since all hands are visible you can plan the entire play sequence. Work out which cards to lead to set up your partner's strong suits. Interfere with the bot's communication by controlling the led suits. This is the purest form of whist strategy!`,
  settings: doubleDummyWhistSettings,
  initialState: (seed: number, _settings: DDWSettingsType) =>
    initialState(seed, { placeholder: "none" }),
  reducer,
  isTerminal,
  component: DoubleDummyWhist,
};
