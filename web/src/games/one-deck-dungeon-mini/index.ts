import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { OneDeckDungeonMiniState, OneDeckDungeonMiniAction, OneDeckDungeonMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { OneDeckDungeonMiniGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const oneDeckDungeonMiniPlugin: GamePlugin<OneDeckDungeonMiniState, OneDeckDungeonMiniAction, typeof settings> = {
  id:"one-deck-dungeon-mini",
  title:"One Deck Dungeon Mini",
  category:"dice",
  players:{ min:1, max:1, multiplayer:false },
  description:"Solo dungeon dice with growing difficulty.",
  howToPlay:"One Deck Dungeon Mini is a 10-round solo dungeon-crawl dice game inspired by the small-box favorite. Each round, you roll four dice and face a difficulty equal to 8 plus the round number (so round 1 needs 9, round 10 needs 18). If your dice sum meets or exceeds the difficulty, you score the round number times 5. Otherwise score 0. 🗝\n\nEarly rounds are easy wins; late rounds get brutal. Maybe 5-7 wins per game. Across 10 rounds, expect totals between 30 and 80.\n\nPress Roll to face the dungeon, then Next to descend deeper. The difficulty target shows above your dice. Each die displays its face. Score 70+ to clear the One Deck Dungeon. The game embodies the original's escalating tension in a brisk, satisfying run that finishes in well under a minute — a perfect quick fantasy adventure for any short break.",
  settings,
  initialState:(seed:number,s:S)=>initialState(seed,s as OneDeckDungeonMiniSettings),
  reducer,
  isTerminal,
  component:OneDeckDungeonMiniGame,
};
