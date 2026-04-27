import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ReggaeQuizSettings { questions: "10" | "20" | "30"; }
export interface ReggaeQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ReggaeQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Bob Marley's first studio album with the Wailers on Island was?", choices: ["Catch a Fire", "Burnin'", "Natty Dread", "Rastaman Vibration"], correct: 0 },
  { question: "The Wailers originally featured Bob Marley, Peter Tosh and?", choices: ["Bunny Wailer", "Toots Hibbert", "Jimmy Cliff", "Burning Spear"], correct: 0 },
  { question: "Reggae developed in Jamaica during which decade?", choices: ["1940s", "1950s", "1960s", "1970s"], correct: 2 },
  { question: "'No Woman, No Cry' was a hit live version on which album?", choices: ["Live!", "Babylon by Bus", "Exodus", "Survival"], correct: 0 },
  { question: "Lee 'Scratch' Perry's studio was nicknamed?", choices: ["The Black Ark", "Dynamic Sounds", "Tuff Gong", "Studio One"], correct: 0 },
  { question: "King Tubby is considered a pioneer of?", choices: ["Ska", "Dub", "Mento", "Lovers rock"], correct: 1 },
  { question: "Studio One was founded by?", choices: ["Coxsone Dodd", "Duke Reid", "Prince Buster", "Joe Gibbs"], correct: 0 },
  { question: "Jimmy Cliff starred in which film?", choices: ["Rockers", "The Harder They Come", "Countryman", "Babylon"], correct: 1 },
  { question: "Toots & the Maytals's 'Funky Kingston' came out in?", choices: ["1973", "1975", "1977", "1980"], correct: 0 },
  { question: "Black Uhuru is a famous reggae?", choices: ["Solo artist", "Vocal trio", "Producer", "Sound system"], correct: 1 },
  { question: "Burning Spear is the stage name of?", choices: ["Winston Rodney", "Garnet Silk", "Beres Hammond", "Horace Andy"], correct: 0 },
  { question: "Dub music heavily uses which technique?", choices: ["Auto-Tune", "Reverb and echo", "Fingerstyle bass", "Tap dance breaks"], correct: 1 },
  { question: "Sly & Robbie are a famous duo of?", choices: ["Bass and drums", "Guitar and keys", "Producer and singer", "Engineer and toaster"], correct: 0 },
  { question: "Dancehall arose primarily in which decade?", choices: ["1970s", "1980s", "1990s", "2000s"], correct: 1 },
  { question: "Shabba Ranks won Grammy in?", choices: ["Reggae Album", "Reggae Recording", "World Music", "Best New Artist"], correct: 0 },
  { question: "Sean Paul is known for the album?", choices: ["Stage One", "Dutty Rock", "The Trinity", "Imperial Blaze"], correct: 1 },
  { question: "Damian Marley's father is?", choices: ["Ziggy Marley", "Bob Marley", "Bunny Wailer", "Cedella"], correct: 1 },
  { question: "Lovers rock subgenre was popular in?", choices: ["Kingston", "London", "Brooklyn", "Toronto"], correct: 1 },
  { question: "Trojan Records is associated with?", choices: ["Soul", "UK ska/reggae", "Punk", "Hip hop"], correct: 1 },
  { question: "'Pressure Drop' is a song by?", choices: ["Toots & the Maytals", "Bob Marley", "Steel Pulse", "Israel Vibration"], correct: 0 },
  { question: "The 2 Tone label promoted which revival?", choices: ["Reggae", "Ska", "Dub", "Dancehall"], correct: 1 },
  { question: "Steel Pulse is from?", choices: ["Jamaica", "UK", "USA", "Canada"], correct: 1 },
  { question: "Buju Banton's most acclaimed roots album is?", choices: ["Voice of Jamaica", "Til Shiloh", "Inna Heights", "Friends for Life"], correct: 1 },
  { question: "Chronixx is associated with which modern movement?", choices: ["Trap dancehall", "Reggae revival", "Lovers rock", "Old-school ska"], correct: 1 },
  { question: "'Three Little Birds' includes the lyric?", choices: ["Don't worry about a thing", "Get up, stand up", "I shot the sheriff", "Stir it up"], correct: 0 },
  { question: "Augustus Pablo played which signature instrument?", choices: ["Melodica", "Trumpet", "Vibraphone", "Saxophone"], correct: 0 },
  { question: "Israel Vibration is a vocal?", choices: ["Duo", "Trio", "Quartet", "Solo project"], correct: 1 },
  { question: "Yellowman was the first dancehall artist signed to?", choices: ["Atlantic", "CBS Records", "Island", "VP Records"], correct: 1 },
  { question: "Mento music is the precursor to?", choices: ["Ska", "Dub", "Calypso", "Lovers rock"], correct: 0 },
  { question: "Beres Hammond is famous for?", choices: ["Hardcore dancehall", "Lovers rock and roots", "Sound clashes", "Production for Sean Paul"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ReggaeQuizSettings): ReggaeQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ReggaeQuizState, action: ReggaeQuizAction): ReggaeQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ReggaeQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
