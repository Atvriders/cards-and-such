import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { StarforgedVowsState, StarforgedVowsAction, StarforgedVowsSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StarforgedVowsGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const starforgedVowsPlugin: GamePlugin<StarforgedVowsState, StarforgedVowsAction, typeof settings> = {
  id: "starforged-vows",
  title: "Starforged: Iron Vows",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo SF RPG homage — sworn vows drive sector journeys.",
  howToPlay: "Starforged: Iron Vows is a solo RPG homage to Shawn Tomkin's Ironsworn: Starforged, a science-fiction successor that adds sector maps, starships, and settlement mechanics to the iron-vow framework.\n\nAcross ten oracle entries you guide a wanderer through the deep dark — accept missions, swear iron vows, plot jumps, and confront the unknown. Each entry presents four weighted choices (A-D); your pick assigns a base reward plus 0-20 of seeded mulberry32 variance. Choose to protect the vulnerable or extract resources, to share oracle truth or hold a secret tight.\n\nThe original Starforged uses asset cards, oracles, and move-trigger mechanics to drive emergent fiction. This solo digital homage replaces the dice ladder with weighted choice-and-roll, while preserving the journaling, vow-keeping, and sector-survival tone.\n\nFulfilled vows are how Starforged measures heroes. End your saga having sworn — and kept — a few good ones.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StarforgedVowsSettings),
  reducer, isTerminal, hint: (state: StarforgedVowsState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-starforged-vows-primary"]', pulses: 3 } : null), component: StarforgedVowsGame,
};
