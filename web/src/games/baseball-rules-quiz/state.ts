import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BaseballRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface BaseballRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BaseballRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many innings in a regulation MLB game?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "How many outs per inning, per team?", choices: ["2", "3", "4", "6"], correct: 1 },
  { question: "How many strikes for a strikeout?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "How many balls for a walk?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Distance between bases (MLB)?", choices: ["80 feet", "85 feet", "90 feet", "100 feet"], correct: 2 },
  { question: "Distance from pitcher's mound to home plate?", choices: ["54 feet", "60 feet 6 inches", "62 feet", "66 feet"], correct: 1 },
  { question: "How many players on a baseball team's roster (MLB active)?", choices: ["23", "25", "26", "30"], correct: 2 },
  { question: "What is the infield fly rule designed to prevent?", choices: ["Cheap doubles", "Easy double plays", "Stolen bases", "Balks"], correct: 1 },
  { question: "A balk awards baserunners?", choices: ["Two bases", "One base", "No advance", "Coach's choice"], correct: 1 },
  { question: "A foul ball with two strikes is?", choices: ["A strikeout", "A foul ball, no count change", "A ball", "A double"], correct: 1 },
  { question: "How wide is home plate?", choices: ["12 inches", "15 inches", "17 inches", "20 inches"], correct: 2 },
  { question: "Standard outfield wall distance varies, but a center field minimum (MLB) is around?", choices: ["350 ft", "400 ft", "420 ft", "450 ft"], correct: 1 },
  { question: "On a dropped third strike with first base unoccupied and less than 2 outs, the runner can?", choices: ["Always run", "Never run", "Run only with two outs", "Run only with bases loaded"], correct: 1 },
  { question: "A walk-off home run is hit?", choices: ["First inning", "Last at-bat by home team to win", "By the pitcher", "In a tie game"], correct: 1 },
  { question: "How many umpires in a typical MLB game?", choices: ["2", "3", "4", "6"], correct: 2 },
  { question: "A batter hits the ball, runner on second tags up after the catch — when can the runner go?", choices: ["Before catch", "After ball is caught", "At the first bounce", "Anytime"], correct: 1 },
  { question: "MLB pitch clock duration with bases empty (2023+)?", choices: ["12 seconds", "15 seconds", "20 seconds", "25 seconds"], correct: 1 },
  { question: "MLB pitch clock with runners on base?", choices: ["18 seconds", "20 seconds", "22 seconds", "25 seconds"], correct: 1 },
  { question: "DH rule places a designated hitter for which position?", choices: ["Catcher", "Pitcher", "Shortstop", "Center fielder"], correct: 1 },
  { question: "Which scorer notation is a 4-6-3 double play?", choices: ["Pitcher to catcher to first", "Second to short to first", "Third to short to first", "Right to center to first"], correct: 1 },
  { question: "A perfect game has how many baserunners?", choices: ["0", "1", "3", "9"], correct: 0 },
  { question: "How many bases on the diamond?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "When a runner is hit by a batted ball in fair territory and is not a force play, the runner is?", choices: ["Safe", "Out", "Awarded next base", "Returned to last base"], correct: 1 },
  { question: "Standard mound height (MLB)?", choices: ["8 inches", "10 inches", "12 inches", "14 inches"], correct: 1 },
  { question: "Extra-innings runner rule (post-2020) starts whom on second base?", choices: ["Last out", "Lead-off", "Pitcher", "Bench player"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BaseballRulesQuizSettings): BaseballRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BaseballRulesQuizState, action: BaseballRulesQuizAction): BaseballRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BaseballRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
