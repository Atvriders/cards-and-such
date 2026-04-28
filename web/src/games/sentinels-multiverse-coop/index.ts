import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, SentinelsMultiverseCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SentinelsMultiverseCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sentinelsMultiverseCoopPlugin: GamePlugin<SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, typeof settings> = {
  id: "sentinels-multiverse-coop",
  title: "Sentinels of the Multiverse Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative superhero homage — heroes battle environment and villain.",
  howToPlay: "Sentinels of the Multiverse Co-op tributes Greater Than Games' beloved cooperative superhero card game. You and an AI superhero ally face down 10 rounds of villain attacks and environment hazards, rolling dice each round to combine attack power. Reach team score 70 to defeat the villain and earn a 50-point bonus.\n\nPress Play Round each turn. Two dice resolve and the sum joins your team score. Press Next Round to continue, Finish on round 10.\n\nThe actual Sentinels of the Multiverse features themed hero, villain, and environment decks with extensive lore and dozens of expansions. This compact homage keeps the cooperative pulse without the deck-shuffling complexity. Whether you imagine yourself as Legacy, Tachyon, or Wraith, your AI ally rolls right beside you.\n\nA definitive edition of Sentinels was released in 2022. This version sticks to the original ethos: pool every roll and share every win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsMultiverseCoopSettings),
  reducer, isTerminal, component: SentinelsMultiverseCoopGame,
};
