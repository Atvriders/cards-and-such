import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AbaloneQuizSettings { questions: "10"; }
export interface AbaloneQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AbaloneQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Abalone is played on a", choices: ["Hexagonal grid of 61 cells", "8x8 square board", "10x10 square board", "Triangular grid"] as [string, string, string, string], correct: 0 },
  { question: "The goal of Abalone is to", choices: ["Push six of opponent marbles off the edge", "Form a long line", "Capture the king", "Reach the center"] as [string, string, string, string], correct: 0 },
  { question: "Marbles can be moved", choices: ["One, two, or three at a time in line or broadside", "Only one at a time", "Only two at a time", "Only diagonally"] as [string, string, string, string], correct: 0 },
  { question: "A sumito (push) requires", choices: ["More attackers than defenders in line", "Equal numbers", "Fewer attackers", "No defenders at all"] as [string, string, string, string], correct: 0 },
  { question: "Abalone was invented in", choices: ["France in 1987", "Greece in 1900", "Japan in 1500", "Brazil in 2010"] as [string, string, string, string], correct: 0 },
  { question: "Each player starts with", choices: ["Fourteen marbles", "Six marbles", "Twenty marbles", "Forty marbles"] as [string, string, string, string], correct: 0 },
  { question: "Standard Abalone setup is called", choices: ["Default or Belgian Daisy variants", "Pacific Rim", "Castle Mode", "Tower Stack"] as [string, string, string, string], correct: 0 },
  { question: "A draw in Abalone occurs when", choices: ["Neither player can push for many turns", "Both reach center", "Marbles touch a corner", "A timer expires"] as [string, string, string, string], correct: 0 },
  { question: "Abalone strategy emphasizes", choices: ["Center control and grouped formations", "Solo marble runs", "Random pushes", "Edge clinging"] as [string, string, string, string], correct: 0 },
  { question: "Abalone is", choices: ["A modern abstract strategy classic", "A pure-luck game", "A trick-taking card game", "A racing game"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AbaloneQuizSettings): AbaloneQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AbaloneQuizState, action: AbaloneQuizAction): AbaloneQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AbaloneQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
