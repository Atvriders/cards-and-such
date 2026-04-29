import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SentinelsDefinitiveState, SentinelsDefinitiveAction, SentinelsDefinitiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SentinelsDefinitiveGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const sentinelsDefinitivePlugin: GamePlugin<SentinelsDefinitiveState, SentinelsDefinitiveAction, typeof settings> = {
  id: "sentinels-definitive",
  title: "Sentinels Definitive",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Sentinels of the Multiverse: Definitive Edition.",
  howToPlay: "Sentinels Definitive is a ten-round cooperative dice tribute to Greater Than Games' Sentinels of the Multiverse: Definitive Edition, the revised superhero combat card game with updated wording and art. You and an AI hero ally roll dice each round to defeat the villain. Team target is 70 across 10 rounds. 💥\n\nEach round both dice are rolled and summed, with the sum added to your team score. Reach 70 by round 10 and the villain is defeated with a +50 hero-team bonus. Per-round averages near 7 mean ten rounds usually clear the target.\n\nPress Play Round to roll, Next Round to advance, and Finish on round 10. The game completes in well under a minute. It distills the Multiverse's cooperative hero-versus-villain drama into a compact pocket session well suited to repeated plays that capture the comic-book feel without all of the deck setup time.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SentinelsDefinitiveSettings),
  reducer, isTerminal, component: SentinelsDefinitiveGame,
};
