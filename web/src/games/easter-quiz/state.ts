import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasterQuizSettings { questions: "10" | "20" | "30"; }
export interface EasterQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasterQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Easter celebrates?", choices: ["The resurrection of Jesus Christ", "The crucifixion", "Christmas", "Pentecost"], correct: 0 },
  { question: "Easter falls on?", choices: ["The first Sunday after the first full moon after the spring equinox", "April 1", "March 25", "Always April 15"], correct: 0 },
  { question: "Good Friday commemorates?", choices: ["The crucifixion", "The resurrection", "The Last Supper", "Pentecost"], correct: 0 },
  { question: "Maundy Thursday commemorates?", choices: ["The Last Supper", "The crucifixion", "The resurrection", "Palm Sunday"], correct: 0 },
  { question: "Palm Sunday begins?", choices: ["Holy Week", "Lent", "Advent", "Easter Tide"], correct: 0 },
  { question: "Lent lasts how many days?", choices: ["40 days (excluding Sundays)", "30 days", "50 days", "20 days"], correct: 0 },
  { question: "Lent starts on?", choices: ["Ash Wednesday", "Palm Sunday", "Good Friday", "Easter Monday"], correct: 0 },
  { question: "What food is traditional at Easter in many cultures?", choices: ["Lamb", "Beef", "Fish", "Pork roast"], correct: 0 },
  { question: "What egg-decorating tradition comes from Ukraine?", choices: ["Pysanky", "Faberge", "Pisanki", "Kraslice"], correct: 0 },
  { question: "Faberge eggs were created for?", choices: ["Russian imperial family", "British royals", "Chinese emperors", "Pope"], correct: 0 },
  { question: "Easter egg hunts originated in?", choices: ["German Lutheran tradition (Osterhase)", "American invention", "Italian custom", "British medieval"], correct: 0 },
  { question: "The Easter Bunny is a folkloric figure from?", choices: ["Germany", "England", "France", "Russia"], correct: 0 },
  { question: "Ukrainian Pysanky uses what technique?", choices: ["Wax-resist (batik)", "Direct paint", "Decoupage", "Carving"], correct: 0 },
  { question: "Where is the largest annual Easter egg roll?", choices: ["The White House lawn", "Buckingham Palace", "Vatican", "Red Square"], correct: 0 },
  { question: "When did the White House Easter Egg Roll begin?", choices: ["1878 (under Hayes)", "1900", "1850", "1920"], correct: 0 },
  { question: "Russian Orthodox Easter often falls?", choices: ["After Western Easter (Julian calendar)", "Before", "Same day always", "In summer"], correct: 0 },
  { question: "Pascha is another name for?", choices: ["Easter", "Christmas", "Pentecost", "Lent"], correct: 0 },
  { question: "Hot cross buns are eaten on?", choices: ["Good Friday traditionally", "Easter Sunday only", "Christmas", "Lent end"], correct: 0 },
  { question: "Cadbury Creme Egg debuted in?", choices: ["1963 (UK)", "1980", "1955", "1990"], correct: 0 },
  { question: "Peeps are made by?", choices: ["Just Born", "Hershey", "Mars", "Cadbury"], correct: 0 },
  { question: "Peeps shape?", choices: ["Marshmallow chicks (and bunnies)", "Eggs", "Bunnies only", "Lambs"], correct: 0 },
  { question: "Easter parade is famously held in?", choices: ["New York City (Fifth Avenue)", "London", "Paris", "Boston"], correct: 0 },
  { question: "Pope's Easter address is called?", choices: ["Urbi et Orbi", "Angelus", "Te Deum", "Magnificat"], correct: 0 },
  { question: "Holy Week ends with?", choices: ["Easter Sunday", "Holy Saturday", "Pentecost", "Trinity Sunday"], correct: 0 },
  { question: "Easter Monday is a public holiday in?", choices: ["Many European/Commonwealth countries", "Just Italy", "Just UK", "Not common"], correct: 0 },
  { question: "Greek Orthodox Easter feature?", choices: ["Red-dyed eggs and roast lamb", "Chocolate bunnies", "White eggs only", "Pumpkin pie"], correct: 0 },
  { question: "What Polish Easter custom involves water on Easter Monday?", choices: ["Smigus-dyngus", "Smigly", "Wielkanoc", "Dyngus"], correct: 3 },
  { question: "Who painted 'Resurrection' (Piero della Francesca)?", choices: ["Piero della Francesca", "Botticelli", "Raphael", "Michelangelo"], correct: 0 },
  { question: "What duration is Eastertide?", choices: ["50 days (until Pentecost)", "40 days", "30 days", "8 days"], correct: 0 },
  { question: "Pentecost is how many days after Easter?", choices: ["50", "40", "30", "60"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasterQuizSettings): EasterQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasterQuizState, action: EasterQuizAction): EasterQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasterQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
