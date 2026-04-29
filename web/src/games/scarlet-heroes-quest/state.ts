import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface JournalPrompt { prompt: string; choices: [string, string, string, string]; weights: [number, number, number, number]; }
export interface ScarletHeroesQuestSettings { dummy: boolean; }
export interface ScarletHeroesQuestState {
  prompts: JournalPrompt[];
  rngSeed: number;
  index: number;
  selected: number | null;
  lastPts: number;
  score: number;
  phase: "choose" | "result" | "done";
}
export type ScarletHeroesQuestAction = { type: "choose"; choice: number } | { type: "next" };
const ALL_PROMPTS: JournalPrompt[] = [
  { prompt: "A village hires you alone for ten silver.", choices: ["Accept the silver","Demand fifteen","Refuse, walk on","Take half upfront"] as [string,string,string,string], weights: [16,12,8,14] as [number,number,number,number] },
  { prompt: "Three bandits at the road's bend.", choices: ["Charge with shout","Parley sharply","Vault into trees","Pretend a friend follows"] as [string,string,string,string], weights: [12,14,10,16] as [number,number,number,number] },
  { prompt: "A grateful smith offers a free blade.", choices: ["Take the blade","Trade your old one","Refuse politely","Order one for spring"] as [string,string,string,string], weights: [14,16,8,12] as [number,number,number,number] },
  { prompt: "A noble offers a quest with conditions.", choices: ["Accept conditions","Counter-offer","Refuse and depart","Steal the quest map"] as [string,string,string,string], weights: [10,16,12,8] as [number,number,number,number] },
  { prompt: "A tavern brawl ignites near you.", choices: ["Wade in laughing","Slip out side door","Defend the barkeep","Bet on the brawler"] as [string,string,string,string], weights: [12,14,16,10] as [number,number,number,number] },
  { prompt: "A wizard offers a single scroll.", choices: ["Spell of fire","Spell of light","Spell of seeking","Refuse the scroll"] as [string,string,string,string], weights: [12,14,16,8] as [number,number,number,number] },
  { prompt: "A dungeon entrance is barred with rune.", choices: ["Bash the runes","Trace and read","Camp until dawn","Find a side path"] as [string,string,string,string], weights: [10,14,12,16] as [number,number,number,number] },
  { prompt: "A cursed weapon whispers to your hand.", choices: ["Bury it","Break it","Carry it sealed","Trade it onward"] as [string,string,string,string], weights: [16,12,14,8] as [number,number,number,number] },
  { prompt: "A captured rival offers parley.", choices: ["Accept ransom","Demand service","Refuse and depart","Free them quietly"] as [string,string,string,string], weights: [14,12,10,16] as [number,number,number,number] },
  { prompt: "Final entry. What do you write home?", choices: ["I am alive","I am rich","I am changed","I am coming home"] as [string,string,string,string], weights: [14,12,16,14] as [number,number,number,number] }
];
export function initialState(seed: number, _s: ScarletHeroesQuestSettings): ScarletHeroesQuestState {
  return { prompts: ALL_PROMPTS, rngSeed: seed, index: 0, selected: null, lastPts: 0, score: 0, phase: "choose" };
}
export function reducer(state: ScarletHeroesQuestState, action: ScarletHeroesQuestAction): ScarletHeroesQuestState {
  if (state.phase === "done") return state;
  if (action.type === "choose") {
    if (state.phase !== "choose") return state;
    const p = state.prompts[state.index]!;
    const baseW = p.weights[action.choice]!;
    const rng = mulberry32(state.rngSeed);
    const variance = Math.floor(rng() * 21);
    const nextSeed = Math.floor(rng() * 2 ** 31);
    const pts = baseW + variance;
    return { ...state, rngSeed: nextSeed, selected: action.choice, lastPts: pts, score: state.score + pts, phase: "result" };
  }
  if (action.type === "next") {
    if (state.phase !== "result") return state;
    const ni = state.index + 1;
    if (ni >= state.prompts.length) return { ...state, phase: "done" };
    return { ...state, index: ni, selected: null, lastPts: 0, phase: "choose" };
  }
  return state;
}
export function isTerminal(state: ScarletHeroesQuestState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
