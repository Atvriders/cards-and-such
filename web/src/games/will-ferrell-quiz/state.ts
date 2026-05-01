import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface WillFerrellQuizSettings { questions: "10" | "20" | "30"; }
export interface WillFerrellQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type WillFerrellQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What year was Will Ferrell born?", choices: ["1963", "1967", "1971", "1975"], correct: 1 },
  { question: "Will Ferrell joined SNL in?", choices: ["1993", "1995", "1997", "1999"], correct: 1 },
  { question: "Ferrell starred as Ron Burgundy in?", choices: ["Anchorman", "Step Brothers", "Talladega Nights", "Old School"], correct: 0 },
  { question: "What 2003 holiday comedy features Ferrell as Buddy?", choices: ["Elf", "Old School", "Stranger than Fiction", "Bewitched"], correct: 0 },
  { question: "Who directed 'Elf' (2003)?", choices: ["Jon Favreau", "Adam McKay", "Judd Apatow", "Will Ferrell"], correct: 0 },
  { question: "In 'Talladega Nights' (2006), Ferrell plays a NASCAR driver named?", choices: ["Ricky Bobby", "Cal Naughton", "Reese Bobby", "Jean Girard"], correct: 0 },
  { question: "Ferrell co-stars with John C. Reilly in which 2008 comedy?", choices: ["Step Brothers", "Old School", "Talladega Nights", "Anchorman 2"], correct: 0 },
  { question: "Ferrell's SNL impression of which President was iconic?", choices: ["George W. Bush", "Bill Clinton", "Barack Obama", "Ronald Reagan"], correct: 0 },
  { question: "Ferrell co-founded which comedy website?", choices: ["Funny or Die", "CollegeHumor", "The Onion", "Cracked"], correct: 0 },
  { question: "In 'Old School' (2003), Ferrell's character earns what nickname?", choices: ["Frank the Tank", "Frankie Frank", "Hard Frank", "Tankman"], correct: 0 },
  { question: "Who directed 'Anchorman'?", choices: ["Adam McKay", "Judd Apatow", "Jon Favreau", "Todd Phillips"], correct: 0 },
  { question: "What year did 'Anchorman 2' release?", choices: ["2010", "2013", "2014", "2016"], correct: 1 },
  { question: "Ferrell played Mugatu in which Stiller film?", choices: ["Zoolander", "Tropic Thunder", "Dodgeball", "Night at the Museum"], correct: 0 },
  { question: "In 'Stranger Than Fiction' (2006), Ferrell plays?", choices: ["Harold Crick", "Buddy", "Brennan Huff", "Chazz Michael Michaels"], correct: 0 },
  { question: "Ferrell stars opposite Jon Heder in which figure-skating comedy?", choices: ["Blades of Glory", "Semi-Pro", "Kicking & Screaming", "Step Brothers"], correct: 0 },
  { question: "Ferrell played Robert Goulet in which SNL recurring sketch theme?", choices: ["Music celebrity impressions", "Goulet's ABA segment", "Game shows", "News reports"], correct: 0 },
  { question: "Ferrell's Bush impression often used what catchphrase?", choices: ["Strategery", "Misunderestimated", "Newcular", "Nuke-u-lar"], correct: 0 },
  { question: "Ferrell graduated from which California university?", choices: ["USC", "UCLA", "Stanford", "Cal State Fullerton"], correct: 0 },
  { question: "What 2015 film co-stars Ferrell with Mark Wahlberg as dad rivals?", choices: ["Daddy's Home", "Get Hard", "The House", "Holmes & Watson"], correct: 0 },
  { question: "Ferrell plays Lord Business in which animated film?", choices: ["The Lego Movie", "Megamind", "Despicable Me", "Toy Story 4"], correct: 0 },
  { question: "Ferrell starred in 2010's 'The Other Guys' opposite?", choices: ["Mark Wahlberg", "Steve Carell", "Vince Vaughn", "Owen Wilson"], correct: 0 },
  { question: "Anchorman is set in what city?", choices: ["San Diego", "Los Angeles", "New York", "Chicago"], correct: 0 },
  { question: "Ferrell plays Brennan Huff in?", choices: ["Step Brothers", "Anchorman", "Old School", "Talladega Nights"], correct: 0 },
  { question: "What sport-themed 2008 comedy stars Ferrell as a basketball owner-player?", choices: ["Semi-Pro", "Blades of Glory", "Kicking & Screaming", "Talladega Nights"], correct: 0 },
  { question: "Ferrell played 'James Lipton' on SNL parodying?", choices: ["Inside the Actors Studio", "Charlie Rose", "Tonight Show", "Conan"], correct: 0 },
  { question: "Ferrell portrayed which Eurovision-style Icelandic singer in 2020?", choices: ["Lars Erickssong", "Sigrit", "Erik Hessen", "Olaf"], correct: 0 },
  { question: "Ferrell's 'A Night at the Roxbury' co-starred which SNL alum?", choices: ["Chris Kattan", "Jimmy Fallon", "Tracy Morgan", "Tim Meadows"], correct: 0 },
  { question: "Ferrell hosted SNL many times - what's his notable cowbell sketch?", choices: ["More Cowbell with Christopher Walken", "Drum solo with Carrey", "Cowbell parade", "Cow farm"], correct: 0 },
  { question: "Ferrell often parodies which game show host on SNL?", choices: ["Alex Trebek", "Bob Barker", "Pat Sajak", "Drew Carey"], correct: 0 },
  { question: "Ferrell's 2020 Netflix musical comedy about Eurovision is called?", choices: ["Eurovision Song Contest: The Story of Fire Saga", "Eurovision Song", "Fire Saga", "Sing Eurovision"], correct: 0 },
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
