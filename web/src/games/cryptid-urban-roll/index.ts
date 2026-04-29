import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CryptidUrbanRollState, CryptidUrbanRollAction, CryptidUrbanRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CryptidUrbanRollGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cryptidUrbanRollPlugin: GamePlugin<CryptidUrbanRollState, CryptidUrbanRollAction, typeof settings> = {
  id: "cryptid-urban-roll",
  title: "Cryptid: Urban Legends Roll",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll dice to investigate urban zones; collect evidence on sheets.",
  howToPlay: "Cryptid: Urban Legends Roll is a roll-and-write where dice direct your monster-hunting field agent across urban legend zones, collecting evidence on a 4x4 sheet.\n\nEach round, click Roll to draw a die (1-6) representing evidence quality. Click any empty grid cell to record the find at that zone. The pip is the evidence's credibility. Click Skip if the dice show nothing useful for your current focus.\n\nScoring:\n- Each evidence cell scores its pip value (1-6).\n- +5 per fully investigated row (district verified).\n- +5 per fully investigated column (cryptid trail).\n- +10 for full sheet (cryptid confirmed).\n\n12 rolls total. Urban Legends reward both breadth and depth: spread evidence to lock row bonuses, but stack one column with high pips for the trail bonus. A typical run scores 35-55 points; full mapping reaches 65+. Skip preserves rolls for zones that matter — investigators don't waste flashlight battery on empty alleys. Map carefully and the cryptid reveals itself.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CryptidUrbanRollSettings),
  reducer,
  isTerminal,
  component: CryptidUrbanRollGame,
};
