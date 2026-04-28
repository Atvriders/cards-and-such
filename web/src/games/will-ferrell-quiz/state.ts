import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WillFerrellQuizSettings { questions: "10" | "20" | "30"; }
export interface WillFerrellQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WillFerrellQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Anchorman year?", choices: ["2002", "2004", "2006", "2008"], correct: 1 },
  { question: "Ferrell's character in Anchorman?", choices: ["Ron Burgundy", "Brick Tamland", "Champ Kind", "Brian Fantana"], correct: 0 },
  { question: "Anchorman director?", choices: ["Adam McKay", "Judd Apatow", "Edgar Wright", "David Wain"], correct: 0 },
  { question: "Elf year?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Elf director?", choices: ["Jon Favreau", "Adam McKay", "Tim Burton", "Robert Zemeckis"], correct: 0 },
  { question: "Buddy the Elf is searching for his?", choices: ["Father", "Mother", "Brother", "Friend"], correct: 0 },
  { question: "Talladega Nights year?", choices: ["2004", "2006", "2008", "2010"], correct: 1 },
  { question: "Talladega Nights protagonist?", choices: ["Ricky Bobby", "Cal Naughton", "Reese Bobby", "Walker"], correct: 0 },
  { question: "Step Brothers co-star?", choices: ["John C. Reilly", "Mark Wahlberg", "Adam Sandler", "Tina Fey"], correct: 0 },
  { question: "Step Brothers year?", choices: ["2006", "2008", "2010", "2012"], correct: 1 },
  { question: "Old School year?", choices: ["2001", "2003", "2005", "2007"], correct: 1 },
  { question: "Old School co-stars?", choices: ["Vaughn & Wilson", "Carrey", "Stiller", "Sandler"], correct: 0 },
  { question: "Ferrell joined SNL in?", choices: ["1993", "1995", "1997", "1999"], correct: 1 },
  { question: "Ferrell impression of which president?", choices: ["George W. Bush", "Bill Clinton", "Reagan", "Obama"], correct: 0 },
  { question: "Stranger Than Fiction (2006) director?", choices: ["Marc Forster", "Spike Jonze", "Wes Anderson", "Charlie Kaufman"], correct: 0 },
  { question: "Blades of Glory partner?", choices: ["Jon Heder", "Jack Black", "Owen Wilson", "Vince Vaughn"], correct: 0 },
  { question: "Blades of Glory sport?", choices: ["Hockey", "Figure skating", "Curling", "Bobsled"], correct: 1 },
  { question: "The Other Guys (2010) co-star?", choices: ["Mark Wahlberg", "Dwayne Johnson", "Samuel L. Jackson", "All star in it"], correct: 3 },
  { question: "The Other Guys director?", choices: ["Adam McKay", "Judd Apatow", "Phil Lord", "Jay Roach"], correct: 0 },
  { question: "Get Hard (2015) co-star?", choices: ["Kevin Hart", "Jonah Hill", "Jamie Foxx", "Chris Tucker"], correct: 0 },
  { question: "Daddy's Home year?", choices: ["2013", "2015", "2017", "2019"], correct: 1 },
  { question: "Daddy's Home co-star?", choices: ["Mark Wahlberg", "Dwayne Johnson", "John Cena", "Vin Diesel"], correct: 0 },
  { question: "Anchorman 2 year?", choices: ["2011", "2013", "2015", "2017"], correct: 1 },
  { question: "Holmes & Watson co-star?", choices: ["John C. Reilly", "Steve Carell", "Adam Sandler", "Mark Wahlberg"], correct: 0 },
  { question: "Eurovision: The Story of Fire Saga co-star?", choices: ["Rachel McAdams", "Anne Hathaway", "Amy Adams", "Reese Witherspoon"], correct: 0 },
  { question: "Ferrell co-founded which website?", choices: ["Funny or Die", "CollegeHumor", "Cracked", "Adult Swim"], correct: 0 },
  { question: "Wedding Crashers Ferrell cameo?", choices: ["Yes", "No", "Brief", "Uncredited"], correct: 0 },
  { question: "Megamind (2010) — Ferrell voices?", choices: ["Megamind", "Metro Man", "Hal", "Roxanne"], correct: 0 },
  { question: "Ferrell played which Lego role?", choices: ["Lord Business", "Batman", "Wyldstyle", "Vitruvius"], correct: 0 },
  { question: "Will Ferrell's height?", choices: ["5'10\"", "6'0\"", "6'3\"", "6'6\""], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: WillFerrellQuizSettings): WillFerrellQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: WillFerrellQuizState, action: WillFerrellQuizAction): WillFerrellQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: WillFerrellQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
