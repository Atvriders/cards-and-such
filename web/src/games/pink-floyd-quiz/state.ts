import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PinkFloydQuizSettings { questions: "10" | "20" | "30"; }
export interface PinkFloydQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PinkFloydQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Pink Floyd formed in?", choices: ["1963", "1965", "1967", "1969"], correct: 1 },
  { question: "Original frontman/founder?", choices: ["Syd Barrett", "Roger Waters", "David Gilmour", "Nick Mason"], correct: 0 },
  { question: "Who replaced Syd Barrett?", choices: ["Roger Waters", "David Gilmour", "Rick Wright", "Nick Mason"], correct: 1 },
  { question: "Drummer?", choices: ["Nick Mason", "John Bonham", "Charlie Watts", "Keith Moon"], correct: 0 },
  { question: "Keyboardist (longtime)?", choices: ["Rick Wright", "John Lord", "Keith Emerson", "Tony Banks"], correct: 0 },
  { question: "Bassist/principal songwriter (1970s)?", choices: ["Roger Waters", "John Paul Jones", "John Entwistle", "Geddy Lee"], correct: 0 },
  { question: "'The Dark Side of the Moon' year?", choices: ["1971", "1973", "1975", "1977"], correct: 1 },
  { question: "How many weeks did 'Dark Side' chart on Billboard 200?", choices: ["~50 weeks", "~200 weeks", "~500 weeks", "~900 weeks"], correct: 3 },
  { question: "'Wish You Were Here' year?", choices: ["1973", "1975", "1977", "1979"], correct: 1 },
  { question: "'Wish You Were Here' is partly tribute to?", choices: ["Syd Barrett", "John Lennon", "Roger Waters' father", "Hendrix"], correct: 0 },
  { question: "'The Wall' year?", choices: ["1977", "1979", "1981", "1983"], correct: 1 },
  { question: "'Animals' (1977) inspired by?", choices: ["Orwell's Animal Farm", "Aesop's Fables", "Don Quixote", "1984"], correct: 0 },
  { question: "Who left Pink Floyd in 1985?", choices: ["Roger Waters", "David Gilmour", "Rick Wright", "Nick Mason"], correct: 0 },
  { question: "'The Division Bell' year?", choices: ["1992", "1994", "1996", "1998"], correct: 1 },
  { question: "Final Pink Floyd studio album?", choices: ["The Endless River", "The Division Bell", "A Momentary Lapse of Reason", "The Wall"], correct: 0 },
  { question: "'Endless River' year?", choices: ["2010", "2012", "2014", "2016"], correct: 2 },
  { question: "Iconic prism cover?", choices: ["The Dark Side of the Moon", "Wish You Were Here", "The Wall", "Animals"], correct: 0 },
  { question: "Pink Floyd's iconic flying pig appeared on?", choices: ["Animals", "The Wall", "Dark Side", "Wish You Were Here"], correct: 0 },
  { question: "'Comfortably Numb' is on?", choices: ["The Wall", "The Division Bell", "Wish You Were Here", "Animals"], correct: 0 },
  { question: "'Money' is on?", choices: ["The Dark Side of the Moon", "Wish You Were Here", "The Wall", "Animals"], correct: 0 },
  { question: "'Another Brick in the Wall, Part 2' year?", choices: ["1977", "1979", "1981", "1983"], correct: 1 },
  { question: "Iconic 'Another Brick' choir?", choices: ["School children", "Adult choir", "Solo soprano", "No vocals"], correct: 0 },
  { question: "Roger Waters' solo album '1992'?", choices: ["Amused to Death", "The Pros and Cons of Hitch Hiking", "Radio K.A.O.S.", "Is This the Life We Really Want?"], correct: 0 },
  { question: "Live at Pompeii filmed in?", choices: ["1971", "1973", "1975", "1977"], correct: 0 },
  { question: "Pink Floyd's Hall of Fame inductor?", choices: ["Eric Clapton", "Billy Corgan", "Bruce Springsteen", "John Lennon"], correct: 1 },
  { question: "Hall of Fame induction year?", choices: ["1996", "1998", "2000", "2002"], correct: 0 },
  { question: "Syd Barrett died in?", choices: ["2004", "2006", "2008", "2010"], correct: 1 },
  { question: "Rick Wright died in?", choices: ["2006", "2008", "2010", "2012"], correct: 1 },
  { question: "Pink Floyd named after which two bluesmen?", choices: ["Pink Anderson and Floyd Council", "Floyd Anderson and Pink Council", "Pinkish Floydman", "Made up"], correct: 0 },
  { question: "Director of 'The Wall' film?", choices: ["Alan Parker", "Stanley Kubrick", "Roger Waters", "Gerald Scarfe"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PinkFloydQuizSettings): PinkFloydQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PinkFloydQuizState, action: PinkFloydQuizAction): PinkFloydQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PinkFloydQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
