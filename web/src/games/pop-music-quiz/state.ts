import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PopMusicQuizSettings { questions: "10" | "20" | "30"; }
export interface PopMusicQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PopMusicQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Madonna's 1984 hit 'Like a Virgin' was produced by?", choices: ["Quincy Jones", "Nile Rodgers", "Jam & Lewis", "Babyface"], correct: 1 },
  { question: "Michael Jackson's best-selling album is?", choices: ["Bad", "Off the Wall", "Thriller", "Dangerous"], correct: 2 },
  { question: "Britney Spears's debut single was?", choices: ["Oops!... I Did It Again", "Toxic", "Baby One More Time", "Lucky"], correct: 2 },
  { question: "Taylor Swift's 2014 album was?", choices: ["Red", "1989", "Reputation", "Lover"], correct: 1 },
  { question: "Beyoncé was a member of which group?", choices: ["TLC", "Destiny's Child", "Spice Girls", "En Vogue"], correct: 1 },
  { question: "Rihanna is from which Caribbean nation?", choices: ["Jamaica", "Trinidad", "Barbados", "Dominica"], correct: 2 },
  { question: "Lady Gaga's debut album was?", choices: ["Born This Way", "ARTPOP", "The Fame", "Joanne"], correct: 2 },
  { question: "The Spice Girls' first single was?", choices: ["Wannabe", "Spice Up Your Life", "Say You'll Be There", "Stop"], correct: 0 },
  { question: "'Rolling in the Deep' is by?", choices: ["Adele", "Sam Smith", "Amy Winehouse", "Ellie Goulding"], correct: 0 },
  { question: "Justin Bieber was discovered via?", choices: ["American Idol", "YouTube", "X Factor", "MySpace"], correct: 1 },
  { question: "Backstreet Boys formed in which city?", choices: ["Los Angeles", "Boston", "Orlando", "Atlanta"], correct: 2 },
  { question: "NSYNC's lead singer was?", choices: ["Lance Bass", "JC Chasez", "Justin Timberlake", "Joey Fatone"], correct: 2 },
  { question: "'Shape of You' is a hit by?", choices: ["Bruno Mars", "Ed Sheeran", "James Bay", "Sam Smith"], correct: 1 },
  { question: "Billie Eilish won Album of the Year for?", choices: ["Don't Smile at Me", "When We All Fall Asleep, Where Do We Go?", "Happier Than Ever", "Hit Me Hard and Soft"], correct: 1 },
  { question: "Ariana Grande starred in which Nick show?", choices: ["iCarly", "Victorious", "Drake & Josh", "Big Time Rush"], correct: 1 },
  { question: "'Uptown Funk' features?", choices: ["Mark Ronson and Bruno Mars", "Pharrell and Robin Thicke", "Cee Lo and Daft Punk", "DJ Khaled and Drake"], correct: 0 },
  { question: "Dua Lipa's 'Future Nostalgia' was released in?", choices: ["2018", "2019", "2020", "2021"], correct: 2 },
  { question: "Whitney Houston starred in which film with 'I Will Always Love You'?", choices: ["Waiting to Exhale", "The Bodyguard", "The Preacher's Wife", "Sparkle"], correct: 1 },
  { question: "Mariah Carey debuted in?", choices: ["1988", "1990", "1992", "1995"], correct: 1 },
  { question: "'Believe' (1998) was a comeback hit for?", choices: ["Madonna", "Cher", "Tina Turner", "Donna Summer"], correct: 1 },
  { question: "BTS comes from which country?", choices: ["Japan", "China", "South Korea", "Thailand"], correct: 2 },
  { question: "Coldplay's debut album was?", choices: ["Parachutes", "A Rush of Blood to the Head", "X&Y", "Viva la Vida"], correct: 0 },
  { question: "'Hey Ya!' is a 2003 hit by?", choices: ["OutKast", "Black Eyed Peas", "Usher", "Justin Timberlake"], correct: 0 },
  { question: "Katy Perry's 'Teenage Dream' came out in?", choices: ["2008", "2010", "2012", "2014"], correct: 1 },
  { question: "P!nk's real first name is?", choices: ["Patricia", "Alecia", "Patty", "Pamela"], correct: 1 },
  { question: "Olivia Rodrigo's breakout single was?", choices: ["good 4 u", "drivers license", "deja vu", "vampire"], correct: 1 },
  { question: "George Michael was first famous as part of?", choices: ["Wham!", "ABC", "Tears for Fears", "Spandau Ballet"], correct: 0 },
  { question: "Cyndi Lauper's debut album was?", choices: ["She's So Unusual", "True Colors", "A Night to Remember", "Hat Full of Stars"], correct: 0 },
  { question: "Prince was born in which U.S. city?", choices: ["St. Louis", "Detroit", "Minneapolis", "Chicago"], correct: 2 },
  { question: "ABBA is from which country?", choices: ["Norway", "Denmark", "Sweden", "Finland"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PopMusicQuizSettings): PopMusicQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PopMusicQuizState, action: PopMusicQuizAction): PopMusicQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PopMusicQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
