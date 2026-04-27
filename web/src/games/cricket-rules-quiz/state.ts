import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CricketRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface CricketRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CricketRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many balls in a standard cricket over?", choices: ["4", "5", "6", "8"], correct: 2 },
  { question: "How many players per team on the field?", choices: ["10", "11", "12", "13"], correct: 1 },
  { question: "Length of a cricket pitch (between the stumps)?", choices: ["18 yards", "20 yards", "22 yards", "24 yards"], correct: 2 },
  { question: "LBW stands for?", choices: ["Last Ball Wicket", "Leg Before Wicket", "Leading Bat Wide", "Long Bat Wide"], correct: 1 },
  { question: "Number of wickets to bowl out a side?", choices: ["9", "10", "11", "12"], correct: 1 },
  { question: "How many overs in a One Day International (ODI) innings?", choices: ["20", "40", "50", "60"], correct: 2 },
  { question: "Length of a T20 innings (overs)?", choices: ["10", "15", "20", "30"], correct: 2 },
  { question: "Test match maximum days?", choices: ["3", "4", "5", "7"], correct: 2 },
  { question: "How many runs is a boundary that bounces before crossing?", choices: ["1", "2", "4", "6"], correct: 2 },
  { question: "How many runs is a boundary that crosses without bouncing?", choices: ["2", "3", "4", "6"], correct: 3 },
  { question: "Number of stumps?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "Number of bails?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "A wide ball gives the batting team?", choices: ["1 run + extra ball", "2 runs", "3 runs", "no runs"], correct: 0 },
  { question: "A no-ball typically gives?", choices: ["1 run + free hit (T20/ODI) + extra ball", "Just 1 run", "Just an extra ball", "Nothing"], correct: 0 },
  { question: "DRS stands for?", choices: ["Decision Review System", "Direct Reaction Score", "Defensive Run Setup", "Down Right Score"], correct: 0 },
  { question: "What dismissal happens when batter steps out of crease and is stumped?", choices: ["Caught", "Run out", "Stumped", "Bowled"], correct: 2 },
  { question: "Powerplay in ODIs typically restricts fielders outside circle in which overs?", choices: ["1-10", "11-20", "21-30", "41-50"], correct: 0 },
  { question: "How wide are the stumps (collective)?", choices: ["7 inches", "9 inches", "11 inches", "15 inches"], correct: 1 },
  { question: "Duckworth-Lewis-Stern method is used for?", choices: ["Run rates", "Rain-affected match calculations", "Field placements", "Bowler rotations"], correct: 1 },
  { question: "How many umpires officiate on the field?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Test cricket uses which color ball typically?", choices: ["White", "Pink (day-night)", "Red", "Both red and pink depending"], correct: 3 },
  { question: "Maiden over means?", choices: ["1 wicket", "No runs scored", "6 wickets", "Last over"], correct: 1 },
  { question: "Hat-trick means?", choices: ["3 wickets in 3 balls", "3 boundaries", "3 catches", "3 sixes"], correct: 0 },
  { question: "Hit wicket dismissal means?", choices: ["Batter dislodges own stumps", "Bowler hits stumps", "Catch on the stumps", "Foul ball"], correct: 0 },
  { question: "Highest format of international cricket is?", choices: ["T20", "ODI", "Test", "The Hundred"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CricketRulesQuizSettings): CricketRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CricketRulesQuizState, action: CricketRulesQuizAction): CricketRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CricketRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
