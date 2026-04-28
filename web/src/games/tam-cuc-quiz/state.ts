import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TamCucSettings { questions: "10"; }
export interface TamCucState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TamCucAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tam Cuc is a card game from?", choices: ["China", "Japan", "Vietnam", "Thailand"], correct: 2 },
  { question: "Tam Cuc cards represent the pieces of?", choices: ["Western chess", "Xiangqi", "Shogi", "Janggi"], correct: 1 },
  { question: "A Tam Cuc deck contains how many cards?", choices: ["28", "30", "32", "36"], correct: 2 },
  { question: "Tam Cuc divides cards into how many armies?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "The two armies are usually coloured?", choices: ["White and Black", "Red and Black", "Blue and Yellow", "Green and Red"], correct: 1 },
  { question: "The highest-ranked card is the?", choices: ["General", "Soldier", "Cannon", "Chariot"], correct: 0 },
  { question: "Tam Cuc trick-taking compares?", choices: ["Suits only", "Ranks (with combos)", "Colors only", "Numbers only"], correct: 1 },
  { question: "Tam Cuc can be played by?", choices: ["1 only", "2", "2–4", "6+"], correct: 2 },
  { question: "Pair and triple combos in Tam Cuc?", choices: ["Are illegal", "Beat single cards", "Lose to singles", "Equal singles"], correct: 1 },
  { question: "Tam Cuc shares a heritage with which Chinese deck?", choices: ["Xiangqi card decks", "Hanafuda", "Mahjong", "Kabufuda"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TamCucSettings): TamCucState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TamCucState, action: TamCucAction): TamCucState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TamCucState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
