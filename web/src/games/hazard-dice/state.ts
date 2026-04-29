import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HazardDiceSettings { questions: "10"; }
export interface HazardDiceState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HazardDiceAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Hazard uses how many dice?', choices: ['Two dice', 'Three dice', 'Five dice', 'One die'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hazard is the historical ancestor of?', choices: ['Craps', 'Yahtzee', 'Backgammon', 'Chess'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'In Hazard the shooter calls a?', choices: ["'Main' (5-9)", "'Trump'", "'Wild'", "'Pair'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Main' values are?", choices: ['5, 6, 7, 8, or 9', '1, 2, 3', '10, 11, 12', 'Any number'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "A 'nick' means?", choices: ['An instant win', 'An instant loss', 'A re-roll', 'A pass'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "An 'out' means?", choices: ['An instant loss', 'An instant win', 'A re-roll', 'A double payout'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'If neither nick nor out, the shooter establishes a?', choices: ["'Chance' to repeat before the main", "'Pair' to break", "'Trump' to follow", "'Bust' to clear"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hazard was popular in which era?', choices: ['17th-19th century England', 'Ancient Rome', 'Medieval Japan', 'Modern only'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Hazard's name comes from?", choices: ["Arabic 'al-zahr' meaning dice", "Latin 'casus'", "French 'jeu'", "Greek 'kybos'"], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Hazard is best classified as?', choices: ['A historical casino dice game', 'A solitaire', 'A trick-taking game', "A children's slap game"], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HazardDiceSettings): HazardDiceState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HazardDiceState, action: HazardDiceAction): HazardDiceState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HazardDiceState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
