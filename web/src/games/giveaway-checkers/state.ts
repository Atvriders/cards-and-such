import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GiveawayCheckersSettings { questions: "10"; }
export interface GiveawayCheckersState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GiveawayCheckersAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Giveaway Checkers win condition", choices: ["Be the first to lose all your pieces (or be unable to move)", "Capture all opponent pieces", "Promote a king", "Reach the last row"], correct: 0 },
  { question: "Captures are", choices: ["Mandatory when available", "Optional", "Forbidden", "Only by kings"], correct: 0 },
  { question: "Stalemate counts as", choices: ["A win for the stalemated side", "A loss", "A draw", "A redo"], correct: 0 },
  { question: "Compared with Suicide Checkers, Giveaway is", choices: ["Effectively identical with relaxed stalemate rules", "Wildly different", "Played with cards", "On a hex board"], correct: 0 },
  { question: "Board is the", choices: ["Standard 8×8 checkers board", "10×10", "12×12", "Hex"], correct: 0 },
  { question: "Kings still", choices: ["Move long-range diagonally as in standard", "Cannot move", "Move like chess knights", "Are removed"], correct: 0 },
  { question: "A typical opening idea is to", choices: ["Force the opponent into capturing your pieces", "Build a strong wall", "Promote first", "Avoid all captures"], correct: 0 },
  { question: "Choosing which capture is best is", choices: ["Critical — you may have multiple capture sequences", "Irrelevant", "Decided by coin flip", "Random each turn"], correct: 0 },
  { question: "Giveaway favors the player who", choices: ["Plans capture chains several moves ahead", "Moves randomly", "Refuses to capture", "Always promotes"], correct: 0 },
  { question: "Giveaway Checkers belongs to the", choices: ["Misère/anti-game family", "Race game family", "Chess family", "Mancala family"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: GiveawayCheckersSettings): GiveawayCheckersState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GiveawayCheckersState, action: GiveawayCheckersAction): GiveawayCheckersState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GiveawayCheckersState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
