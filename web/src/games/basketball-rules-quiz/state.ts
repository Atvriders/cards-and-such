import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BasketballRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface BasketballRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BasketballRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players from one team are on the court at once?", choices: ["4", "5", "6", "7"], correct: 1 },
  { question: "How long is an NBA shot clock?", choices: ["20 seconds", "24 seconds", "30 seconds", "35 seconds"], correct: 1 },
  { question: "How many points is a successful three-point shot?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Taking too many steps without dribbling is called?", choices: ["Carrying", "Traveling", "Hacking", "Goaltending"], correct: 1 },
  { question: "Free throws awarded for a shooting foul on a missed 3-pointer?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Duration of an NBA quarter?", choices: ["10 minutes", "12 minutes", "15 minutes", "20 minutes"], correct: 1 },
  { question: "Personal fouls before an NBA player fouls out?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "FIBA international shot clock length?", choices: ["20 seconds", "24 seconds", "30 seconds", "35 seconds"], correct: 1 },
  { question: "Touching the ball above the rim on a downward path is?", choices: ["Boxing out", "Goaltending", "Charging", "Blocking"], correct: 1 },
  { question: "Length of an NBA court?", choices: ["84 feet", "90 feet", "94 feet", "100 feet"], correct: 2 },
  { question: "NBA three-point line distance at the top of the arc?", choices: ["22 feet", "22.15 feet", "23.75 feet", "25 feet"], correct: 2 },
  { question: "How long to advance the ball past half-court (NBA)?", choices: ["5 seconds", "8 seconds", "10 seconds", "12 seconds"], correct: 1 },
  { question: "Free-throw line distance from the backboard?", choices: ["12 feet", "13 feet", "15 feet", "18 feet"], correct: 2 },
  { question: "Defensive 3-second violation occurs after how many seconds in the lane?", choices: ["2", "3", "5", "8"], correct: 1 },
  { question: "Standard rim height in the NBA?", choices: ["9 feet", "10 feet", "11 feet", "12 feet"], correct: 1 },
  { question: "How many overtime periods are played until a winner emerges?", choices: ["1", "3", "As many as needed", "5"], correct: 2 },
  { question: "A held ball in the NBA results in?", choices: ["Jump ball", "Possession arrow", "Coin flip", "Free throw"], correct: 0 },
  { question: "Length of an NBA overtime period?", choices: ["3 minutes", "4 minutes", "5 minutes", "7 minutes"], correct: 2 },
  { question: "How long to inbound the ball from the sideline?", choices: ["3 seconds", "5 seconds", "8 seconds", "10 seconds"], correct: 1 },
  { question: "Timeouts each NBA team starts the game with?", choices: ["4", "6", "7", "9"], correct: 2 },
  { question: "Team is in the bonus after how many fouls in an NBA quarter?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "Diameter of an NBA basketball rim?", choices: ["16 inches", "18 inches", "20 inches", "22 inches"], correct: 1 },
  { question: "Width of a regulation NBA court?", choices: ["40 feet", "50 feet", "60 feet", "75 feet"], correct: 1 },
  { question: "Dribbling, stopping, and dribbling again is what violation?", choices: ["Carrying", "Traveling", "Double-dribble", "Backcourt violation"], correct: 2 },
  { question: "A technical foul awards how many free throws (NBA)?", choices: ["1", "2", "3", "One then possession"], correct: 0 },
  { question: "The painted area below the basket is also known as the?", choices: ["Key", "Arc", "Wing", "Baseline"], correct: 0 },
  { question: "Number of officials in an NBA regular-season game?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "Crossing midcourt and returning is which violation?", choices: ["Travel", "Backcourt violation", "Carry", "Double dribble"], correct: 1 },
  { question: "Held ball arrow alternates in which league rule?", choices: ["NBA", "NCAA", "FIBA", "WNBA"], correct: 1 },
  { question: "How many points is a free throw worth?", choices: ["1", "2", "3", "Half"], correct: 0 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BasketballRulesQuizSettings): BasketballRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BasketballRulesQuizState, action: BasketballRulesQuizAction): BasketballRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BasketballRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
