import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { MaoState } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MaoGame } from "./Game.js";

export const maoSettings = {
  dummy: { kind: "enum" as const, label: "Mode", options: ["off"] as const, default: "off" as const },
} as const;

type MaoAction =
  | { type: "play"; cardId: string; announcement?: string }
  | { type: "draw" }
  | { type: "acknowledgePenalty" };

export const maoPlugin: GamePlugin<MaoState, MaoAction, typeof maoSettings> = {
  id: "mao",
  title: "Mao",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "The card game with secret rules. Play cards, discover hidden rules through penalties, and be first to empty your hand.",
  howToPlay: `Mao is a classic social card game famous for its secret rules — the rules themselves are never explained upfront, and you discover them by breaking them and receiving penalties.

Core mechanics: play a card matching the suit or rank of the top discard card. If you can't play, draw one card.

Secret rules: at the start of each game, 2 random secret rules become active. You don't know what they are! When you break a rule (e.g., forgetting to say something when playing a special card), you receive a penalty card and the rule is revealed to you.

Announcements: before playing, type anything you want to say in the text box. Certain secret rules require you to say specific phrases when playing certain cards. Discovering rules is the fun of Mao!

Classic rules might include: saying "Good game" on an Ace, "Have a nice day" on a 7, saying "Point" on a Jack, or announcing the suit when playing a Heart.

Winning: the first player to empty their hand wins. In the traditional game, you must also say "Mao" on your last card — but we'll let that slide here. Score 100 for a win.`,
  settings: maoSettings,
  initialState,
  reducer,
  isTerminal,
  component: MaoGame,
};
