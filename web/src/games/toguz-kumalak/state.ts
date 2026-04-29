import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ToguzKumalakSettings { questions: "10"; }
export interface ToguzKumalakState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ToguzKumalakAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: 'Toguz Kumalak is from?', choices: ['Kazakhstan/Kyrgyzstan (Central Asia)', 'Uganda', 'Egypt', 'China'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Toguz Kumalak board has?', choices: ['2 rows × 9 pits (18 pits)', '4 rows × 8 pits', '3 rows × 9 pits', '1 row × 14 pits'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Number of seeds is?', choices: ['81 seeds (9 per pit)', '48', '12', '120'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "'Toguz' means?", choices: ['Nine (referring to the pit count)', 'Three', 'Twenty', 'One'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "Captures occur when last seed lands in opponent's pit and?", choices: ["The pit's resulting total is even", "The pit's total is odd", 'Always (no condition)', 'Last seed is the largest'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: "The 'tuzdyk' is?", choices: ["A claimed special pit on the opponent's side", 'A captured row', 'A double-seed pit', 'A center pit'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Each player can have how many tuzdyks?', choices: ['At most one', 'Up to nine', 'Three', 'None'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Tuzdyks may not be?', choices: ['Directly opposite each other', "On the player's own side", 'In adjacent pits', 'Empty'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'To win, a player must capture?', choices: ['More than 81 seeds (majority)', 'All 81 exactly', 'Eight pits', 'Three rows'], correct: 0 as 0 | 1 | 2 | 3 },
  { question: 'Toguz Kumalak is part of which family?', choices: ['Mancala', 'Chess', 'Dice race', 'Trick-taking'], correct: 0 as 0 | 1 | 2 | 3 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ToguzKumalakSettings): ToguzKumalakState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ToguzKumalakState, action: ToguzKumalakAction): ToguzKumalakState {
  if(state.phase==="done")return state;
  switch(action.type){
    case "select":return state.submitted?state:{...state,selected:action.choice};
    case "submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case "next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ToguzKumalakState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
