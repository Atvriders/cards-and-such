import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CardAdventureMiniState, CardAdventureMiniAction, CardAdventureMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CardAdventureMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cardAdventureMiniPlugin: GamePlugin<CardAdventureMiniState, CardAdventureMiniAction, typeof settings> = {
  id: "card-adventure-mini", title: "Card Adventure Mini", category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "One-page card dungeon prototype. Match dungeon prompts to card encounter type.",
  howToPlay: "Card Adventure Mini is a quiz inspired by Reddit's one-page card dungeon prototype. Each round throws a dungeon room prompt at you ('a chest sits unopened in the corner') and asks which card type from a one-page deck the prototype expects you to draw or play. Twelve rounds, ten points each, max 120. Cards include Trap, Treasure, Monster, Healer, Lockpick, Magic, Buff, and special situational types — a tight playable deck. The educational angle is that this is how a one-page game designer thinks about minimalist mechanics. Card Adventure proves you don't need 200 cards to make an exciting dungeon-delve; you just need an evocative prompt-to-card relationship. Hit Submit on each pick and Next to advance. Designers and casual players will both appreciate seeing tight design under the hood. Score around 80+ for a card-game design buff; expect 60-70 from anyone unfamiliar with rapid prototyping but with reasonable card-game intuition. Quick run, two minutes total.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CardAdventureMiniSettings),
  reducer, isTerminal, hint: (state: CardAdventureMiniState): HintTarget | null => state.phase === "playing" ? { selector: '[data-testid="hint-target-card-adventure-mini-answer-0"]', pulses: 3 } : null, component: CardAdventureMiniGame,
};
