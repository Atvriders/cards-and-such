import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ArimaaQuizSettings { questions: "10"; }
export interface ArimaaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ArimaaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Arimaa was designed by", choices: ["Omar Syed in 2003", "Bobby Fischer", "Magnus Carlsen", "Garry Kasparov"] as [string, string, string, string], correct: 0 },
  { question: "Arimaa was invented to be", choices: ["Hard for computers but intuitive for humans", "Easy for computers", "A children only game", "A trivia game"] as [string, string, string, string], correct: 0 },
  { question: "Arimaa pieces move with", choices: ["Push and pull mechanics in addition to step moves", "Just like chess pieces", "Like checkers only", "Like Go stones"] as [string, string, string, string], correct: 0 },
  { question: "Arimaa is played on", choices: ["An 8x8 board with traps", "A 9x9 board", "A hex grid", "A 10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "The goal of Arimaa is to", choices: ["Push your rabbit to the opposite rank", "Capture all pieces", "Form a line", "Surround the king"] as [string, string, string, string], correct: 0 },
  { question: "Trap squares in Arimaa", choices: ["Capture unsupported pieces resting there", "Are safe zones", "Heal pieces", "Random teleport"] as [string, string, string, string], correct: 0 },
  { question: "Each turn in Arimaa, a player makes", choices: ["Up to four steps with their pieces", "Exactly one move", "Two moves", "Eight moves"] as [string, string, string, string], correct: 0 },
  { question: "Computers eventually beat Arimaa in", choices: ["2015 (David Wu bot)", "2003", "Never", "2030"] as [string, string, string, string], correct: 0 },
  { question: "The strongest Arimaa pieces are", choices: ["Elephants", "Rabbits", "Cats", "Dogs"] as [string, string, string, string], correct: 0 },
  { question: "Arimaa is played online at", choices: ["Arimaa.com community site", "Lichess only", "No platform", "Mahjong sites"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: ArimaaQuizSettings): ArimaaQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ArimaaQuizState, action: ArimaaQuizAction): ArimaaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ArimaaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
