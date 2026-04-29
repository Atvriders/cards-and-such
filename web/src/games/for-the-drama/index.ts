import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { ForTheDramaState, ForTheDramaAction, ForTheDramaSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ForTheDramaGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const forTheDramaPlugin: GamePlugin<ForTheDramaState, ForTheDramaAction, typeof settings> = {
  id: "for-the-drama",
  title: "For the Drama",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Solo telenovela journaling; passion, betrayal, last reveal.",
  howToPlay: "For the Drama is a solo journaling homage to Alex Roberts' For the Queen, here flavored as a telenovela where you serve at the heart of a passionate household. The original For the Queen is a co-op storytelling game where players answer prompts about loyalty and betrayal; the last card reveals whose hand spilled the wine.\n\nAcross ten dramatic prompts you confess scenes — secret letters, missed embraces, lipstick on collars, doors slammed in courtyards. Each prompt offers four weighted choices (A-D); your pick assigns a base reward plus 0-20 of mulberry32 variance.\n\nThis solo digital homage compresses the round table into one diary, preserving the soap-operatic tension of obligation versus desire. There are no wrong answers — only revealing ones.\n\nWrite the scenes you'd never confess aloud. The drama earns more weight when it costs you something.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ForTheDramaSettings),
  reducer, isTerminal, component: ForTheDramaGame,
};
