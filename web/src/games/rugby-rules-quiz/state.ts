import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface RugbyRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface RugbyRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type RugbyRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players per team in rugby union?", choices: ["13", "14", "15", "16"], correct: 2 },
  { question: "How many players per team in rugby league?", choices: ["12", "13", "14", "15"], correct: 1 },
  { question: "Points for a try in rugby union?", choices: ["3", "4", "5", "7"], correct: 2 },
  { question: "Points for a conversion in rugby union?", choices: ["1", "2", "3", "5"], correct: 1 },
  { question: "Points for a penalty kick in rugby union?", choices: ["2", "3", "5", "7"], correct: 1 },
  { question: "Points for a drop goal in rugby union?", choices: ["1", "2", "3", "5"], correct: 2 },
  { question: "Length of a rugby union half?", choices: ["30 minutes", "35 minutes", "40 minutes", "45 minutes"], correct: 2 },
  { question: "Halftime length in rugby union (typical)?", choices: ["10 minutes", "15 minutes", "20 minutes", "No break"], correct: 0 },
  { question: "Forward pass is?", choices: ["Legal", "Illegal", "Allowed only on penalties", "Allowed on kickoffs"], correct: 1 },
  { question: "A scrum is restarted after which type of infringement (typically)?", choices: ["Try", "Knock-on or forward pass", "Penalty kick", "Conversion"], correct: 1 },
  { question: "How many players in a rugby union scrum?", choices: ["6", "7", "8", "9"], correct: 2 },
  { question: "How many players in a rugby league scrum?", choices: ["6", "7", "8", "9"], correct: 0 },
  { question: "A lineout is used to restart play after?", choices: ["Ball goes out over touch", "Knock-on", "Try", "Conversion"], correct: 0 },
  { question: "How long is a yellow card sin bin in rugby union?", choices: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"], correct: 1 },
  { question: "Red card means?", choices: ["Sin bin 10 minutes", "Permanent removal from game", "Penalty kick", "Free kick"], correct: 1 },
  { question: "Number of officials in a top-level rugby union match (on-field plus assistants)?", choices: ["1", "2", "3 (referee + 2 touch judges)", "5"], correct: 2 },
  { question: "Maul is formed when?", choices: ["Ball is on the ground with players over it", "Ball carrier is held but on feet with teammates bound", "Ball goes over the touchline", "A try is scored"], correct: 1 },
  { question: "Ruck is formed when?", choices: ["Players bind over ball on the ground", "Ball carrier is upright", "Ball is in the air", "After conversion"], correct: 0 },
  { question: "In rugby league, how many tackles before turnover?", choices: ["4", "5", "6", "7"], correct: 2 },
  { question: "Try in rugby league is worth?", choices: ["3", "4", "5", "6"], correct: 1 },
  { question: "Conversion in rugby league is worth?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Drop goal in rugby league is worth?", choices: ["1", "2", "3", "4"], correct: 0 },
  { question: "Penalty goal in rugby league is worth?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "Maximum substitutions in international rugby union (matchday 23)?", choices: ["3", "5", "8", "Unlimited"], correct: 2 },
  { question: "In rugby union, how is play restarted after a try and conversion?", choices: ["Drop kick from halfway", "Scrum", "Lineout", "Throw-in"], correct: 0 },
  { question: "A penalty try in rugby union awards how many points?", choices: ["5", "6", "7 (no conversion required)", "10"], correct: 2 },
  { question: "Rugby ball is what shape?", choices: ["Spherical", "Prolate spheroid (oval)", "Cubic", "Cylindrical"], correct: 1 },
  { question: "Where must teammates stay at a ruck?", choices: ["At the offside line", "Behind the hindmost foot", "Anywhere", "Behind the goal line"], correct: 1 },
  { question: "In rugby union, a 22 drop-out is taken when?", choices: ["Defender grounds attacker's kick in their in-goal", "Try is scored", "Penalty awarded", "After conversion"], correct: 0 },
  { question: "World Cup of rugby union is held every?", choices: ["2 years", "3 years", "4 years", "5 years"], correct: 2 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: RugbyRulesQuizSettings): RugbyRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: RugbyRulesQuizState, action: RugbyRulesQuizAction): RugbyRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: RugbyRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
