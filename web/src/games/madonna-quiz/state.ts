import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MadonnaQuizSettings { questions: "10" | "20" | "30"; }
export interface MadonnaQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MadonnaQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Madonna's full name?", choices: ["Madonna Louise Ciccone", "Madonna Ciccone Smith", "Madonna Marie Smith", "Madonna Williams"], correct: 0 },
  { question: "Year of birth?", choices: ["1956", "1958", "1960", "1962"], correct: 1 },
  { question: "Madonna's hometown?", choices: ["Detroit area, Michigan", "New York City", "Chicago", "Los Angeles"], correct: 0 },
  { question: "First major hit?", choices: ["Holiday", "Like a Virgin", "Material Girl", "Borderline"], correct: 0 },
  { question: "'Like a Virgin' year?", choices: ["1982", "1984", "1986", "1988"], correct: 1 },
  { question: "'Like a Prayer' year?", choices: ["1986", "1989", "1991", "1993"], correct: 1 },
  { question: "Most provocative 1989 video sparked Pepsi controversy?", choices: ["Like a Prayer", "Vogue", "Material Girl", "Express Yourself"], correct: 0 },
  { question: "'Vogue' year?", choices: ["1988", "1990", "1992", "1994"], correct: 1 },
  { question: "Best-selling album?", choices: ["The Immaculate Collection", "Like a Virgin", "Ray of Light", "True Blue"], correct: 0 },
  { question: "Madonna starred in 'Evita' (1996) as?", choices: ["Eva Perón", "Evita Smith", "Eva Braun", "Mary Magdalene"], correct: 0 },
  { question: "Madonna won a Golden Globe for?", choices: ["Evita", "Truth or Dare", "A League of Their Own", "Desperately Seeking Susan"], correct: 0 },
  { question: "'Ray of Light' year?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Producer for 'Ray of Light'?", choices: ["William Orbit", "Stuart Price", "Mirwais", "Nile Rodgers"], correct: 0 },
  { question: "'Confessions on a Dance Floor' producer?", choices: ["Stuart Price", "William Orbit", "Mirwais", "Pat Leonard"], correct: 0 },
  { question: "Madonna married whom (first marriage)?", choices: ["Sean Penn", "Guy Ritchie", "Carlos Leon", "Warren Beatty"], correct: 0 },
  { question: "Year Madonna married Sean Penn?", choices: ["1983", "1985", "1987", "1989"], correct: 1 },
  { question: "Second husband?", choices: ["Guy Ritchie", "Sean Penn", "Carlos Leon", "Tony Ward"], correct: 0 },
  { question: "Madonna's children include?", choices: ["Lourdes, Rocco, David, Mercy, twins", "Just Lourdes", "Just Rocco", "Just David"], correct: 0 },
  { question: "Madonna's tour-documentary movie?", choices: ["Truth or Dare", "Body of Evidence", "Desperately Seeking Susan", "Evita"], correct: 0 },
  { question: "Madonna's major book release in 1992?", choices: ["Sex", "Madonna's Story", "Truth", "True Blue"], correct: 0 },
  { question: "'Material Girl' is from?", choices: ["Like a Virgin", "Madonna (debut)", "True Blue", "Erotica"], correct: 0 },
  { question: "Madonna inducted into Rock and Roll Hall of Fame in?", choices: ["2006", "2008", "2010", "2012"], correct: 1 },
  { question: "Hit Bond theme by Madonna?", choices: ["Die Another Day", "Goldeneye", "Skyfall", "No Time to Die"], correct: 0 },
  { question: "Madonna's record label launched in 1992?", choices: ["Maverick", "Warner", "Reprise", "Geffen"], correct: 0 },
  { question: "'4 Minutes' featured?", choices: ["Justin Timberlake", "Pharrell", "Both", "Britney Spears"], correct: 2 },
  { question: "'Hung Up' samples ABBA song?", choices: ["Gimme Gimme Gimme", "Mamma Mia", "Dancing Queen", "Waterloo"], correct: 0 },
  { question: "MTV Video Music Awards 1984 controversial performance song?", choices: ["Like a Virgin", "Material Girl", "Borderline", "Lucky Star"], correct: 0 },
  { question: "Madonna's album of children's books series?", choices: ["The English Roses", "Roses for Lourdes", "Lola's Tales", "M Stories"], correct: 0 },
  { question: "Iconic music video featured Marilyn Monroe homage?", choices: ["Material Girl", "Vogue", "Like a Virgin", "Borderline"], correct: 0 },
  { question: "Madonna's nickname?", choices: ["Queen of Pop", "Princess of Pop", "Material Girl", "Both first and third"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MadonnaQuizSettings): MadonnaQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MadonnaQuizState, action: MadonnaQuizAction): MadonnaQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MadonnaQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
