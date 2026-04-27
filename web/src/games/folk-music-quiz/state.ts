import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FolkMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface FolkMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FolkMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bob Dylan's birth name is?", choices: ["Robert Allen Zimmerman", "Robert James Smith", "Robert Anthony Plant", "Robert Daltrey"], correct: 0 },
  { question: "Joan Baez's debut album was titled?", choices: ["Joan Baez", "Diamonds & Rust", "Farewell, Angelina", "David's Album"], correct: 0 },
  { question: "Woody Guthrie famously wrote on his guitar?", choices: ["Music for the People", "This Machine Kills Fascists", "We Shall Overcome", "Peace in Our Time"], correct: 1 },
  { question: "Pete Seeger played which instrument?", choices: ["Mandolin", "Banjo", "Fiddle", "Lap steel"], correct: 1 },
  { question: "Peter, Paul and Mary's first hit was?", choices: ["Lemon Tree", "If I Had a Hammer", "Puff, the Magic Dragon", "500 Miles"], correct: 1 },
  { question: "'Blowin' in the Wind' was written by?", choices: ["Woody Guthrie", "Bob Dylan", "Joan Baez", "Phil Ochs"], correct: 1 },
  { question: "Simon & Garfunkel's iconic album is?", choices: ["Bookends", "Bridge Over Troubled Water", "Sounds of Silence", "Parsley, Sage, Rosemary and Thyme"], correct: 1 },
  { question: "Joni Mitchell is from which country?", choices: ["USA", "Canada", "UK", "Australia"], correct: 1 },
  { question: "James Taylor's first hit was?", choices: ["Fire and Rain", "You've Got a Friend", "Carolina in My Mind", "Sweet Baby James"], correct: 0 },
  { question: "The Kingston Trio's 1958 hit was?", choices: ["Tom Dooley", "Greenback Dollar", "Where Have All the Flowers Gone", "Five Hundred Miles"], correct: 0 },
  { question: "Newport Folk Festival is held in which state?", choices: ["Vermont", "Rhode Island", "New York", "Massachusetts"], correct: 1 },
  { question: "Phil Ochs's biggest song is?", choices: ["I Ain't Marching Anymore", "Changes", "There but for Fortune", "Outside of a Small Circle of Friends"], correct: 0 },
  { question: "Leadbelly is associated with which instrument?", choices: ["Banjo", "Twelve-string guitar", "Harmonica", "Fiddle"], correct: 1 },
  { question: "The Lomax family is famous for?", choices: ["Songwriting", "Field recordings", "Festival promotion", "Music journalism"], correct: 1 },
  { question: "Mumford & Sons are from?", choices: ["USA", "UK", "Ireland", "Canada"], correct: 1 },
  { question: "Fleet Foxes hail from?", choices: ["Portland", "Seattle", "San Francisco", "Brooklyn"], correct: 1 },
  { question: "Bon Iver's debut album was?", choices: ["Bon Iver, Bon Iver", "22, A Million", "For Emma, Forever Ago", "i,i"], correct: 2 },
  { question: "Iron & Wine is the project of?", choices: ["Sufjan Stevens", "Sam Beam", "M. Ward", "Conor Oberst"], correct: 1 },
  { question: "Sufjan Stevens released albums about which two states?", choices: ["Michigan & Illinois", "Ohio & Iowa", "Minnesota & Wisconsin", "New York & Maine"], correct: 0 },
  { question: "The Byrds covered which Bob Dylan song to a hit?", choices: ["Like a Rolling Stone", "Mr. Tambourine Man", "Blowin' in the Wind", "All Along the Watchtower"], correct: 1 },
  { question: "Cat Stevens's 'Tea for the Tillerman' came out in?", choices: ["1968", "1970", "1972", "1974"], correct: 1 },
  { question: "John Denver's 'Take Me Home, Country Roads' references?", choices: ["Tennessee", "West Virginia", "Kentucky", "Virginia"], correct: 1 },
  { question: "Townes Van Zandt's signature song is?", choices: ["Pancho and Lefty", "If I Needed You", "To Live Is to Fly", "Tecumseh Valley"], correct: 0 },
  { question: "Tracy Chapman's 1988 self-titled album included?", choices: ["Fast Car", "Give Me One Reason", "Talkin' Bout a Revolution", "Both A and C"], correct: 3 },
  { question: "The Carter Family is considered foundational to?", choices: ["Bluegrass", "Country & folk", "Cajun", "Old-time fiddle"], correct: 1 },
  { question: "'House of the Rising Sun' is a traditional?", choices: ["English ballad", "Appalachian ballad", "Scottish reel", "Irish jig"], correct: 1 },
  { question: "Suzanne Vega's biggest single is?", choices: ["Tom's Diner", "Luka", "Marlene on the Wall", "Caramel"], correct: 1 },
  { question: "Indigo Girls is a duo of?", choices: ["Sara & Tegan", "Amy Ray & Emily Saliers", "Sarah & Jess", "Norah & Diana"], correct: 1 },
  { question: "Nick Drake released how many studio albums?", choices: ["Two", "Three", "Four", "Five"], correct: 1 },
  { question: "Donovan was a contemporary of?", choices: ["Elvis", "Bob Dylan", "James Brown", "Frank Sinatra"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FolkMusicQuizSettings): FolkMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FolkMusicQuizState, action: FolkMusicQuizAction): FolkMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FolkMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
