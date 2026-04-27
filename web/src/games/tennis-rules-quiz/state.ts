import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TennisRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface TennisRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TennisRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the score after winning your first point in a game?", choices: ["1", "15", "30", "5"], correct: 1 },
  { question: "Score sequence in a game?", choices: ["1-2-3", "15-30-40-game", "5-10-15-20", "10-20-30-40"], correct: 1 },
  { question: "Tied at 40-40 is called?", choices: ["Deuce", "Advantage", "Tiebreak", "Set point"], correct: 0 },
  { question: "How many points must you win after deuce to win the game?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Length of a tennis court (baseline to baseline)?", choices: ["72 feet", "78 feet", "84 feet", "90 feet"], correct: 1 },
  { question: "Singles court width?", choices: ["24 feet", "27 feet", "30 feet", "36 feet"], correct: 1 },
  { question: "Doubles court width?", choices: ["27 feet", "30 feet", "33 feet", "36 feet"], correct: 3 },
  { question: "Net height at the center?", choices: ["3 feet", "3.5 feet", "4 feet", "4.5 feet"], correct: 0 },
  { question: "Standard tiebreak first to?", choices: ["5", "7", "10", "11"], correct: 1 },
  { question: "Win-by margin in a tiebreak?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Grand Slam men's match is best of?", choices: ["3", "5", "7", "9"], correct: 1 },
  { question: "Grand Slam women's match is best of?", choices: ["3", "5", "7", "9"], correct: 0 },
  { question: "What is a double fault?", choices: ["Two consecutive faults losing point", "Two aces", "Foot fault", "Net cord serve"], correct: 0 },
  { question: "A let serve is?", choices: ["Faulted serve", "Net-clipped serve replayed", "Out serve", "Ace"], correct: 1 },
  { question: "How many serves does a player get per point?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "What is a break of serve?", choices: ["Winning a game on opponent's serve", "Stopping play", "Serving twice", "Hitting the net"], correct: 0 },
  { question: "Set is won at?", choices: ["First to 4", "First to 6 with 2-game lead", "First to 8", "First to 10"], correct: 1 },
  { question: "Who serves first in a set?", choices: ["Decided by coin toss", "Always home player", "Highest seed", "Random"], correct: 0 },
  { question: "When can a player switch sides during a set?", choices: ["After every game", "After odd-numbered games", "Whenever", "Never"], correct: 1 },
  { question: "Foot fault is called when?", choices: ["Foot crosses baseline before contact", "Foot in alley", "Foot on net", "Foot lifts"], correct: 0 },
  { question: "Wimbledon's playing surface is?", choices: ["Clay", "Grass", "Hard", "Carpet"], correct: 1 },
  { question: "French Open playing surface?", choices: ["Clay", "Grass", "Hard", "Carpet"], correct: 0 },
  { question: "US Open and Australian Open surface (currently)?", choices: ["Clay", "Grass", "Hard", "Carpet"], correct: 2 },
  { question: "Hawk-Eye is used for?", choices: ["Coaching", "Line-call review", "Scorekeeping", "Crowd control"], correct: 1 },
  { question: "How many challenges per set under standard ATP/WTA rules?", choices: ["1", "2", "3", "5"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TennisRulesQuizSettings): TennisRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TennisRulesQuizState, action: TennisRulesQuizAction): TennisRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TennisRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
