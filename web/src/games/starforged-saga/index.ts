import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { StarforgedSagaState, StarforgedSagaAction, StarforgedSagaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { StarforgedSagaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const starforgedSagaPlugin: GamePlugin<StarforgedSagaState, StarforgedSagaAction, typeof settings> = {
  id: "starforged-saga",
  title: "Starforged Saga",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo sci-fi journaling homage to Ironsworn: Starforged.",
  howToPlay: "Starforged Saga channels the spirit of Shawn Tomkin's sci-fi successor to Ironsworn, where a forged-spirited spacer treads the void with a starship, sworn iron vows, and a sector full of mysteries.\n\nAcross ten narrative entries, you make decisions about ship encounters, sector exploration, settlements, and pacts with strange factions. Each prompt offers four choices A-D; choosing assigns a base reward plus 0-20 variance via the seeded mulberry32 oracle. Total your way through the saga and watch your score build.\n\nStarforged in full is a 350+ page rulebook with truths-of-the-universe creation, ship moves, and detailed oracle tables. This solo homage keeps the spirit while shrinking the moves to clear, weighty choices.\n\nImagine the silence between stars, the hum of life-support, the gravity of every covenant. The Forge is vast, but every choice you make in your log ripples out across the sector. Forge well, spacer.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as StarforgedSagaSettings),
  reducer, isTerminal, hint: (state: StarforgedSagaState): HintTarget | null => (state.phase === "choose" ? { selector: '[data-testid="hint-target-starforged-saga-primary"]', pulses: 3 } : null), component: StarforgedSagaGame,
};
