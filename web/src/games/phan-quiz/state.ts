import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhanSettings { questions: "10"; }
export interface PhanState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhanAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Phan is from which country?", choices: ["Vietnam", "Thailand", "Cambodia", "Laos"], correct: 0 },
  { question: "Phan is fundamentally a?", choices: ["Solo puzzle", "Banker-vs-players gambling card game", "Trick-taking partnership", "Bidding contract game"], correct: 1 },
  { question: "Phan most commonly uses?", choices: ["Hanafuda", "A Vietnamese-marked deck", "A Standard 52-card deck only", "Dominos"], correct: 1 },
  { question: "Phan belongs to the wider family of?", choices: ["Mahjong", "Fan-tan", "Hwatu", "Tarot"], correct: 1 },
  { question: "Phan is most popular during?", choices: ["Mid-Autumn", "Tet (Lunar New Year)", "Children's Day", "Hung Kings"], correct: 1 },
  { question: "Phan involves players competing primarily against?", choices: ["Each other", "The banker", "The dealer's spouse", "Random AI"], correct: 1 },
  { question: "Winning hands score by?", choices: ["Highest card only", "Combinations like pairs and runs", "Trump suit only", "Captured stones"], correct: 1 },
  { question: "Phan typically supports how many players?", choices: ["Solo", "Exactly 4", "2–6", "9+"], correct: 2 },
  { question: "The banker role in Phan is?", choices: ["Random", "Often rotating or chosen", "Always the youngest", "Always the host"], correct: 1 },
  { question: "Phan emphasizes which mix?", choices: ["Pure skill", "Skill and luck (with social betting)", "Pure luck", "Long memorization"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: PhanSettings): PhanState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhanState, action: PhanAction): PhanState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhanState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
