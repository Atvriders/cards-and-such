import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HanaAwaseSettings { questions: "10"; }
export interface HanaAwaseState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HanaAwaseAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The phrase 'Hana Awase' literally means?", choices: ["Flower contest", "Flower match", "Flower bloom", "Flower wave"], correct: 1 },
  { question: "Hana Awase introduces players to what core deck?", choices: ["Tarot", "Hanafuda", "Mahjong", "Kabufuda"], correct: 1 },
  { question: "How many cards bear each month in Hana Awase?", choices: ["2", "3", "4", "6"], correct: 2 },
  { question: "When matching, you pair cards from?", choices: ["Your hand only", "Your hand to the table", "Discards to the deck", "All four players' hands"], correct: 1 },
  { question: "After matching, you draw and?", choices: ["Discard one", "Show all hands", "Match the drawn card if possible", "Pass turn"], correct: 2 },
  { question: "The game ends when?", choices: ["12 rounds complete", "Hand cards are exhausted", "Time runs out", "One player has all cards"], correct: 1 },
  { question: "Which is the highest card grade by points?", choices: ["Kasu", "Tan", "Tane", "Hikari"], correct: 3 },
  { question: "The 'Sakura' (cherry blossom) suit represents which month?", choices: ["February", "March", "April", "May"], correct: 1 },
  { question: "The crane card depicts?", choices: ["A red sun and crane", "A pine tree and crane", "Cherry petals", "A full moon"], correct: 1 },
  { question: "Hana Awase's appeal is mostly?", choices: ["Speed and luck", "Educational simplicity", "Tournament prestige", "Heavy gambling"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HanaAwaseSettings): HanaAwaseState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HanaAwaseState, action: HanaAwaseAction): HanaAwaseState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HanaAwaseState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
