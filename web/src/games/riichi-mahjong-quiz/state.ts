import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RiichiMahjongSettings { questions: "10"; }
export interface RiichiMahjongState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RiichiMahjongAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Riichi Mahjong is the Mahjong tradition of?", choices: ["China", "Japan", "Korea", "Singapore"], correct: 1 },
  { question: "Declaring 'riichi' requires?", choices: ["A complete hand", "Being one tile away (tenpai)", "Holding all winds", "Drawing a special tile"], correct: 1 },
  { question: "Declaring riichi costs the player?", choices: ["100 points", "500 points", "1000 points", "5000 points"], correct: 2 },
  { question: "The 'dora' system rewards a player with?", choices: ["Bonus tiles for free", "Bonus han for matching the indicator", "Free riichi", "Discounted yaku"], correct: 1 },
  { question: "A red five tile in Riichi is called?", choices: ["Akadora", "Bakaze", "Honba", "Kanken"], correct: 0 },
  { question: "A complete Riichi hand contains how many tiles?", choices: ["13", "14", "16", "17"], correct: 1 },
  { question: "Riichi Mahjong is played by how many players?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Calling 'pon' means?", choices: ["Claim discarded tile to form a triplet", "Win", "Skip", "Cancel turn"], correct: 0 },
  { question: "Calling 'chi' means?", choices: ["Form a sequence from a left-neighbour discard", "Win", "Discard last", "Cancel"], correct: 0 },
  { question: "A 'mangan' is a?", choices: ["Yaku type", "Score limit / large hand", "Penalty", "Discard rule"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: RiichiMahjongSettings): RiichiMahjongState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RiichiMahjongState, action: RiichiMahjongAction): RiichiMahjongState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RiichiMahjongState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
