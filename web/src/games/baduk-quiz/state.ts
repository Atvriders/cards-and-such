import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BadukSettings { questions: "10"; }
export interface BadukState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BadukAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Baduk is the Korean name for?", choices: ["Go", "Mahjong", "Hanafuda", "Janggi"], correct: 0 },
  { question: "Standard Baduk is played on a?", choices: ["9x9 board", "13x13 board", "19x19 board", "21x21 board"], correct: 2 },
  { question: "Lee Sedol famously played a 2016 series against?", choices: ["Kasparov", "AlphaGo", "Hikaru", "Magnus"], correct: 1 },
  { question: "AlphaGo's match was vs which Korean Baduk player?", choices: ["Lee Chang-ho", "Lee Sedol", "Park Junghwan", "Cho Hunhyun"], correct: 1 },
  { question: "Korean Baduk professionals are organised in?", choices: ["KBA – Korean Baduk Association", "JBA", "WSBC", "FIDE"], correct: 0 },
  { question: "Baduk pieces are called?", choices: ["Tiles", "Stones", "Pawns", "Beads"], correct: 1 },
  { question: "The first move in Baduk is by?", choices: ["Black", "White", "Either", "Random"], correct: 0 },
  { question: "Korean professional Baduk is famous for?", choices: ["Defensive play", "Aggressive 'Korean style'", "Random moves", "Few openings"], correct: 1 },
  { question: "A Baduk match is won by?", choices: ["Capturing king", "Most territory plus captures", "Highest die", "Race"], correct: 1 },
  { question: "Komi in Baduk is given to which colour?", choices: ["Black", "White", "Both", "Neither"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: BadukSettings): BadukState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BadukState, action: BadukAction): BadukState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BadukState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
