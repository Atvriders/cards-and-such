import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { swImperialAssaultCoopState, swImperialAssaultCoopAction, swImperialAssaultCoopSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { swImperialAssaultCoopGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const swImperialAssaultCoopPlugin: GamePlugin<swImperialAssaultCoopState, swImperialAssaultCoopAction, typeof settings> = {
  id: "sw-imperial-assault-coop",
  title: "Star Wars: Imperial Assault (Solo)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Cooperative dungeon-crawl — Imperial Assault solo mode over ten rounds.",
  howToPlay: "Star Wars: Imperial Assault (Solo) is a cooperative dungeon-crawl distilled to ten dice rounds. You and an app-controlled Imperial AI roll over ten rounds; the rebel score builds against the Empire's pull.\n\nEach round, press Play Round. Two dice (yours and the Empire's) tumble; the sum (2-12) joins your rebel score. Press Next Round to advance, Finish on round ten.\n\nThe rebel mission target is 70. Hit it and the rebellion succeeds with a +50 Mission Complete bonus. Fall short and the Empire wins the day, but you live to fight another mission.\n\nThe original Imperial Assault is a campaign-driven cooperative game with maps, miniatures, and an app for Imperial activation. This distillation preserves the cooperative tension across ten rounds without the map-based dungeon-crawl. A solid mission scores around 70; a heroic Jedi-tier run pushes 80+; a tough mission stalls at 60.\n\nMay the dice be with you, rebel.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as swImperialAssaultCoopSettings),
  reducer,
  isTerminal,
  component: swImperialAssaultCoopGame,
};
