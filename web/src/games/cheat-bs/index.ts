import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CheatBsState, CheatBsAction, CheatBsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CheatBsGame } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["10"] as const, default: "10" as const },
} as const;
type S = SettingsOf<typeof settings>;

export const cheatBsPlugin: GamePlugin<CheatBsState, CheatBsAction, typeof settings> = {
  id: "cheat-bs",
  title: "Cheat / BS",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: `Solo BS / Cheat: CPU plays a card claiming a rank, you decide whether to call the bluff.`,
  howToPlay: `Cheat (also called BS or I Doubt It) is a classic card-shedding bluff game. In this solo adaptation, the CPU plays a single card face-down each round and announces what it is. You must decide whether to trust the claim or call the bluff.

The CPU's mannerisms vary. Calmer body language usually signals a truthful claim — but not always. Nervous fidgeting often hints at a bluff, but a wily opponent may fake tells to throw you off. Use the body-language cue and your instincts together.

Each round you have two buttons: Trust accepts the claim; Call Bluff! challenges it. After your decision, the CPU's actual card is revealed. If you guessed correctly — either trusting truth or correctly calling a bluff — you score 100 points.

There are ten rounds total, scoring up to 1000 points. Aim for at least seven correct calls to feel like a seasoned card sharp; nine or ten makes you a master mind-reader.

Tips: in real Cheat the bluffing rate hovers around 40–60 percent, so don't always trust or always call. Track patterns and balance your responses.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CheatBsSettings),
  reducer,
  isTerminal,
  component: CheatBsGame,
};
