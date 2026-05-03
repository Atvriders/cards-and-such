import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { GoStopState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { GoStop } from "./GoStop.js";

const goStopSettings = {} as const;
type GoStopSettings = SettingsOf<typeof goStopSettings>;
type GoStopAction = { type: "play"; cardId: string };

export const goStopCardPlugin: GamePlugin<GoStopState, GoStopAction, typeof goStopSettings> = {
  id: "go-stop",
  title: "Go Stop",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Korean Go-Stop simplified to a trick-style duel.",
  howToPlay: `Go-Stop is a popular Korean card-and-capture game played with the 48-card hanafuda flower pack. This simplified version reimagines Go-Stop as a trick-taking duel using a standard 52-card deck with diamonds as trump. You and the bot each receive 10 cards. Each trick: follow the led suit if able, otherwise play any card including trump. Highest diamond wins; otherwise highest of the led suit. Click cards to play. Trick winner leads next. Strategy: the iconic Go-Stop choice (continue or stop) is omitted here; instead, focus on capturing tricks. Lead long side suits early to flush trumps, then cash your aces and remaining diamonds. Score is tricks taken — capture 6 of 10 tricks to win the round. The seed determines deals so the same seed reproduces the same hand for replay.`,
  settings: goStopSettings,
  initialState: (seed: number, _settings: GoStopSettings) => initialState(seed),
  reducer,
  isTerminal,
  hint: (state: any) => {
      if (state.phase === "playing") return { selector: '[data-testid="hint-target-go-stop-hand"]', pulses: 3 };
      return null;
    },
  component: GoStop,
};
