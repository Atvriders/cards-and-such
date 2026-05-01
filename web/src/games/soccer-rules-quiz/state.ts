import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SoccerRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface SoccerRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SoccerRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players from one team are on the field in soccer?", choices: ["9", "10", "11", "12"], correct: 2 },
  { question: "Length of a standard soccer half?", choices: ["35 minutes", "40 minutes", "45 minutes", "50 minutes"], correct: 2 },
  { question: "Length of halftime in most professional matches?", choices: ["10 minutes", "15 minutes", "20 minutes", "25 minutes"], correct: 1 },
  { question: "Number of substitutions allowed in most FIFA matches (since 2022)?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "A direct red card results in?", choices: ["Yellow card", "Sin bin", "Ejection and team plays a man down", "No effect"], correct: 2 },
  { question: "Two yellow cards in a match equal?", choices: ["Warning", "Red card", "Penalty kick", "Free kick"], correct: 1 },
  { question: "Distance of a penalty kick from the goal line?", choices: ["10 yards", "11 yards", "12 yards", "18 yards"], correct: 2 },
  { question: "Penalty area extends how far from the goal line?", choices: ["12 yards", "16 yards", "18 yards", "20 yards"], correct: 2 },
  { question: "Diameter of the center circle?", choices: ["10 yards", "18 yards", "20 yards", "30 yards"], correct: 2 },
  { question: "A goal kick is taken from where?", choices: ["Penalty spot", "Inside the goal area", "Center spot", "Corner arc"], correct: 1 },
  { question: "A corner kick is taken from?", choices: ["Center circle", "Penalty spot", "Corner arc", "Goal line midpoint"], correct: 2 },
  { question: "Offside is called when an attacker is closer to the goal line than?", choices: ["The ball only", "The second-to-last defender and the ball", "The goalkeeper only", "Any defender"], correct: 1 },
  { question: "Free kicks come in two types?", choices: ["Direct and indirect", "Long and short", "Hard and soft", "Open and closed"], correct: 0 },
  { question: "Goalkeeper may handle the ball only inside?", choices: ["Center circle", "Penalty area", "Goal area", "Anywhere"], correct: 1 },
  { question: "A throw-in must be taken with?", choices: ["One hand", "Two hands over the head", "A foot", "Either hand"], correct: 1 },
  { question: "Soccer ball circumference (size 5)?", choices: ["22-24 inches", "25-26 inches", "27-28 inches", "30 inches"], correct: 2 },
  { question: "Standard goal width?", choices: ["6 feet", "7 feet", "8 yards", "10 yards"], correct: 2 },
  { question: "Standard goal height?", choices: ["6 feet", "7 feet", "8 feet", "10 feet"], correct: 2 },
  { question: "Number of head referees on the field?", choices: ["1", "3", "4", "5"], correct: 0 },
  { question: "Assistant referees primarily control which calls?", choices: ["Fouls", "Offside and out-of-bounds", "Corners only", "Penalties only"], correct: 1 },
  { question: "Knockout-stage extra time is usually how long?", choices: ["10 minutes", "20 minutes", "30 minutes", "40 minutes"], correct: 2 },
  { question: "In a penalty shootout, how many initial kicks per side?", choices: ["3", "4", "5", "6"], correct: 2 },
  { question: "Back-pass rule: a goalkeeper cannot handle the ball when?", choices: ["Always", "Passed deliberately by foot of teammate", "Passed by chest", "On a throw-in to teammate"], correct: 1 },
  { question: "VAR stands for?", choices: ["Video Assistant Referee", "Verified Action Replay", "Variable Action Review", "Virtual Assistant Ref"], correct: 0 },
  { question: "Time wasting can result in?", choices: ["Yellow card", "Red card", "Penalty", "Indirect free kick only"], correct: 0 },
  { question: "A header into your own goal counts as?", choices: ["Own goal", "Disallowed", "Free kick", "Corner"], correct: 0 },
  { question: "If the ball deflects off the referee and a goal results, the result is typically?", choices: ["Goal stands", "Drop ball", "Goal disallowed if it changes possession", "Free kick"], correct: 2 },
  { question: "Drop ball is awarded to?", choices: ["Either team", "The team that last touched it", "The team in possession when play stopped", "A coin flip"], correct: 2 },
  { question: "Foul throw on a throw-in results in?", choices: ["Goal kick", "Throw-in to opponent", "Free kick", "Penalty"], correct: 1 },
  { question: "Maximum field length per IFAB Laws?", choices: ["100 yards", "110 yards", "120 yards", "130 yards"], correct: 2 }

];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SoccerRulesQuizSettings): SoccerRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SoccerRulesQuizState, action: SoccerRulesQuizAction): SoccerRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SoccerRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
