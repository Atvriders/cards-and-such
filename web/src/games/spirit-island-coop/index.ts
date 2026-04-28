import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { SpiritIslandCoopState, SpiritIslandCoopAction, SpiritIslandCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { SpiritIslandCoopGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const spiritIslandCoopPlugin: GamePlugin<SpiritIslandCoopState, SpiritIslandCoopAction, typeof settings> = {
  id: "spirit-island-coop",
  title: "Spirit Island Co-op",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative spiritual defense — repel invaders by combined power.",
  howToPlay: "Spirit Island Co-op condenses R. Eric Reuss's heavy strategic cooperative classic into a 10-round dice celebration. You play a spirit alongside an AI ally; together you rack up power points to drive invaders from your shared island. A team total of 70 wins, with a 50-point bonus on top.\n\nPress Play Round each turn. Both dice tumble and their combined sum boosts the team score. Press Next Round, or Finish on round 10.\n\nIn the full Spirit Island, each spirit has unique powers, fear tokens, blight, and a complex web of synergies. This adaptation keeps only the cooperative core: every roll belongs to both of you, and victory or defeat is shared.\n\nWhether you imagine yourself as Lightning's Swift Strike or Vital Strength of the Earth, the rolls determine your reach. With luck and momentum, you'll free your island in time.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as SpiritIslandCoopSettings),
  reducer, isTerminal, component: SpiritIslandCoopGame,
};
