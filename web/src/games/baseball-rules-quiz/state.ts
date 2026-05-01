import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BaseballRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface BaseballRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BaseballRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players from one team are on the field defensively?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "How many innings in a regulation MLB game?", choices: ["7", "8", "9", "10"], correct: 2 },
  { question: "How many strikes is a strikeout?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "How many balls is a walk?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "How many bases must a runner touch to score a run?", choices: ["3", "4", "5", "2"], correct: 1 },
  { question: "Distance between MLB bases?", choices: ["80 feet", "90 feet", "100 feet", "120 feet"], correct: 1 },
  { question: "Distance from pitcher's mound to home plate (MLB)?", choices: ["56 feet", "60 feet 6 inches", "65 feet", "70 feet"], correct: 1 },
  { question: "How many outs per half-inning?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "A batter hit by a pitch is awarded what?", choices: ["First base", "Second base", "Out", "Strike"], correct: 0 },
  { question: "MLB pitch clock with bases empty?", choices: ["10 seconds", "15 seconds", "20 seconds", "25 seconds"], correct: 1 },
  { question: "MLB pitch clock with runners on?", choices: ["15 seconds", "18 seconds", "20 seconds", "25 seconds"], correct: 2 },
  { question: "How many umpires in a typical MLB regular-season game?", choices: ["2", "3", "4", "6"], correct: 2 },
  { question: "A foul ball with two strikes is?", choices: ["Strike three", "Foul, no strike", "Out", "Ball"], correct: 1 },
  { question: "Infield fly rule applies with runners on which bases?", choices: ["First only", "First and second, less than two outs", "Bases loaded only", "Any runner on"], correct: 1 },
  { question: "Designated hitter rule means the DH bats for whom?", choices: ["Catcher", "Shortstop", "Pitcher", "First baseman"], correct: 2 },
  { question: "A balk is called against whom?", choices: ["Batter", "Catcher", "Pitcher", "Runner"], correct: 2 },
  { question: "How many pitchers per team is typical on an MLB active roster?", choices: ["5", "8", "13", "20"], correct: 2 },
  { question: "A home run inside the park requires what?", choices: ["A ball over the fence", "Touching all bases without being put out", "An error", "Two runs"], correct: 1 },
  { question: "How many warm-up pitches are allowed between innings (MLB)?", choices: ["3", "5", "8", "10"], correct: 0 },
  { question: "A starting pitcher needs how many innings to qualify for a win?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "How many bases does a ground-rule double award?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Dropped third strike: batter may run if?", choices: ["Always", "First base unoccupied or two outs", "Never", "Only with two outs and bases empty"], correct: 1 },
  { question: "Sacrifice fly typically scores a runner from which base?", choices: ["First", "Second", "Third", "Home"], correct: 2 },
  { question: "A pitcher hitting two batters in a game can be subject to?", choices: ["Automatic ejection", "Warning and possible ejection", "Forfeit", "Nothing"], correct: 1 },
  { question: "MLB regular-season tie? Game continues how?", choices: ["Extra innings until winner", "Ends as tie", "Penalty shots", "Coin flip"], correct: 0 },
  { question: "How many strikes can a batter foul off after a 2-strike count (no bunting)?", choices: ["1", "3", "Unlimited", "Until bunting"], correct: 2 },
  { question: "A foul tip caught by the catcher with two strikes is?", choices: ["Foul ball", "Strike three out", "No call", "Ball"], correct: 1 },
  { question: "MLB bat may be no longer than how many inches?", choices: ["38", "40", "42", "44"], correct: 2 },
  { question: "Distance from home plate to second base (MLB)?", choices: ["120 feet", "127 feet 3 3/8 inches", "130 feet", "135 feet"], correct: 1 },
  { question: "MLB ball weight is between?", choices: ["4-5 oz", "5-5.25 oz", "5.5-6 oz", "6-6.25 oz"], correct: 1 }

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
