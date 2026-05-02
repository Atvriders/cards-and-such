import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { TinyEpicDungeonMiniState, TinyEpicDungeonMiniAction, TinyEpicDungeonMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TinyEpicDungeonMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const tinyEpicDungeonMiniPlugin: GamePlugin<TinyEpicDungeonMiniState, TinyEpicDungeonMiniAction, typeof settings> = {
  id:"tiny-epic-dungeon-mini",
  title:"Tiny Epic Dungeon Mini",
  category:"cards",
  players:{ min:1, max:1, multiplayer:false },
  description:"A small dungeon delve in card form.",
  howToPlay:"Tiny Epic Dungeon Mini is a 10-round card-driven dungeon delve. Each round, two room cards are revealed from a deck of fantasy locations: Empty Hall (0), Trap (1), Treasure (3), Monster (4), Secret Door (5), and Boss (8). Your round score is the sum of room values. 🗡️\n\nNo decisions — explore the dungeon as the cards fall. Dangerous rooms reward you for surviving them. Across 10 rounds, scores cluster around 70 to 110. A Boss appearance is rare and thrilling — eight points in a single room.\n\nPress Draw to peer into the next two rooms, then Next to descend further. The compact card layout shows each room's name and value. Score 100+ to clear the dungeon as a true tiny hero. The game packs a fantasy crawl into well under a minute — perfect for filling a small break with high adventure.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as TinyEpicDungeonMiniSettings),
  reducer,
  isTerminal,hint: (state) => isTerminal(state) ? null : ({ selector: '[data-testid="hint-target-tiny-epic-dungeon-mini-primary"]', pulses: 3 }),
  component:TinyEpicDungeonMiniGame,
};
