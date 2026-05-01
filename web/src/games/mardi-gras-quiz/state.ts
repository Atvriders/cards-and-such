import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MardiGrasQuizSettings { questions: "10" | "20" | "30"; }
export interface MardiGrasQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MardiGrasQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mardi Gras translates to?", choices: ["Fat Tuesday (French)", "Fat Wednesday", "Big Sunday", "Carnival Friday"], correct: 0 },
  { question: "Mardi Gras occurs on?", choices: ["The day before Ash Wednesday", "Easter Sunday", "Christmas Eve", "Lent end"], correct: 0 },
  { question: "What U.S. city is most famous for Mardi Gras?", choices: ["New Orleans, Louisiana", "Mobile, Alabama", "St. Louis", "Houston"], correct: 0 },
  { question: "Where in the U.S. did Mardi Gras first happen?", choices: ["Mobile, Alabama (1703)", "New Orleans (1718)", "Galveston", "Pensacola"], correct: 0 },
  { question: "New Orleans Mardi Gras dates back to?", choices: ["Early 1700s; first parade 1837", "1900", "1850", "1800"], correct: 0 },
  { question: "Official Mardi Gras colors?", choices: ["Purple, green, gold", "Red, white, blue", "Black and orange", "Pink and white"], correct: 0 },
  { question: "Purple represents?", choices: ["Justice", "Faith", "Power", "Royalty"], correct: 0 },
  { question: "Green represents?", choices: ["Faith", "Justice", "Power", "Hope"], correct: 0 },
  { question: "Gold represents?", choices: ["Power", "Justice", "Faith", "Wealth"], correct: 0 },
  { question: "What are krewes?", choices: ["Mardi Gras parade organizations/clubs", "Police units", "Chefs", "Musicians only"], correct: 0 },
  { question: "Oldest active New Orleans krewe?", choices: ["Mistick Krewe of Comus (since 1857)", "Rex (1872)", "Zulu", "Endymion"], correct: 0 },
  { question: "King Cake contains?", choices: ["A small plastic baby (finder hosts next party)", "A coin", "A pearl", "A nut"], correct: 0 },
  { question: "King Cake is eaten during?", choices: ["Carnival season (January 6 to Mardi Gras)", "Lent", "Easter", "Christmas"], correct: 0 },
  { question: "Beads thrown from floats are called?", choices: ["Throws", "Tosses", "Gifts", "Showers"], correct: 0 },
  { question: "Other common 'throws'?", choices: ["Doubloons (coins) and small toys", "Real money", "Food", "Cards"], correct: 0 },
  { question: "Ash Wednesday begins?", choices: ["Lent (40 days of fasting)", "Easter", "Advent", "Pentecost"], correct: 0 },
  { question: "Lent ends on?", choices: ["Easter Sunday", "Pentecost", "Good Friday", "Palm Sunday"], correct: 0 },
  { question: "Brazilian equivalent of Mardi Gras?", choices: ["Carnival (especially Rio)", "Fat Sunday", "Just Brazil Day", "São João"], correct: 0 },
  { question: "Rio Carnival is best known for?", choices: ["Samba schools parade", "Country music", "Tango", "Folk dance"], correct: 0 },
  { question: "Venice Carnival is famous for?", choices: ["Elaborate masks and costumes", "Boat races", "Eating contests", "Singing competitions"], correct: 0 },
  { question: "Rex is the?", choices: ["King of Carnival in New Orleans", "A krewe ranking", "An author", "A song"], correct: 0 },
  { question: "Zulu Krewe is famous for?", choices: ["Decorated coconuts as throws", "Boats", "Costumes only", "Food contests"], correct: 0 },
  { question: "Bourbon Street is in?", choices: ["French Quarter, New Orleans", "Mobile", "Memphis", "Nashville"], correct: 0 },
  { question: "Carnival season begins on?", choices: ["Twelfth Night (January 6, Epiphany)", "Christmas Eve", "January 1", "Ash Wednesday"], correct: 0 },
  { question: "Mardi Gras Indians are?", choices: ["African American Carnival groups with Native-inspired suits", "Native American tribes", "Indian immigrants", "Sports teams"], correct: 0 },
  { question: "What is 'Fat Tuesday' a final day of feasting before?", choices: ["Lent's fasting period", "Christmas", "Easter", "Pentecost"], correct: 0 },
  { question: "Trinidad and Tobago Carnival features?", choices: ["Calypso, soca music, costumes", "Polka", "Reggae only", "Salsa"], correct: 0 },
  { question: "Mardi Gras World in New Orleans is?", choices: ["Float-building warehouse and tour", "Theme park", "Museum", "Hotel"], correct: 0 },
  { question: "How many people typically attend Mardi Gras in New Orleans?", choices: ["Over 1 million", "100,000", "5 million", "10,000"], correct: 0 },
  { question: "What sandwich is associated with New Orleans?", choices: ["Po'boy", "Hoagie", "Hero", "Grinder"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MardiGrasQuizSettings): MardiGrasQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MardiGrasQuizState, action: MardiGrasQuizAction): MardiGrasQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MardiGrasQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
