import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { AceFinderState, AceFinderAction, AceFinderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { AceFinder } from "./Game.js";

const settings = {
  rounds: { kind: "enum" as const, label: "Rounds", options: ["5", "10"] as const, default: "5" as const },
} as const;

type S = SettingsOf<typeof settings>;

export const aceFinderPlugin: GamePlugin<AceFinderState, AceFinderAction, typeof settings> = {
  id: "ace-finder",
  title: "Ace Finder",
  category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Four cards face down — one is an Ace. Find it! Use a hint to reveal a non-Ace for a small point penalty.",
  howToPlay: `Ace Finder is a simple but fun card hunt. Each round, four cards are placed face down. Exactly one of them is an Ace. Your job is to pick the Ace from the four hidden cards.

Picking the correct card (the Ace) earns you 25 points. If you are not sure, press the Hint button to flip over one non-Ace card — this costs 5 points off your potential reward (you still earn 20 if you then guess correctly). Picking the wrong card earns nothing.

After each round all four cards are revealed so you can see what you missed. Press Next to continue to the next round with a fresh set of cards.

Use Settings to play 5 or 10 rounds. The cards are freshly randomized each round with a seeded shuffle, so every game is different.

Can you spot the Ace every time without using the hint? Score is totaled at the end — try for a perfect run!`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as AceFinderSettings),
  reducer, isTerminal, component: AceFinder,
};
