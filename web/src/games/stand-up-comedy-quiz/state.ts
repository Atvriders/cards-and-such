import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StandUpComedyQuizSettings { questions: "10" | "20" | "30"; }
export interface StandUpComedyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StandUpComedyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "George Carlin's famous '7 Words' bit listed how many words?", choices: ["5", "7", "10", "12"], correct: 1 },
  { question: "Carlin died in?", choices: ["2006", "2008", "2010", "2012"], correct: 1 },
  { question: "Richard Pryor's most famous concert film?", choices: ["Live in Concert", "Live on the Sunset Strip", "Both", "Either is correct"], correct: 3 },
  { question: "Lenny Bruce died in?", choices: ["1962", "1966", "1970", "1974"], correct: 1 },
  { question: "Eddie Murphy's 'Raw' year?", choices: ["1985", "1987", "1989", "1991"], correct: 1 },
  { question: "Eddie Murphy's 'Delirious' year?", choices: ["1981", "1983", "1985", "1987"], correct: 1 },
  { question: "Dave Chappelle's first Netflix special year?", choices: ["2014", "2017", "2019", "2021"], correct: 1 },
  { question: "Bill Burr's podcast?", choices: ["Monday Morning Podcast", "The Joe Rogan Experience", "WTF", "Conan Needs a Friend"], correct: 0 },
  { question: "Joan Rivers's catchphrase?", choices: ["'Can we talk?'", "'I kid'", "'Listen'", "'Be funny'"], correct: 0 },
  { question: "Robin Williams's famous improv on which talk show?", choices: ["Carson", "Letterman", "Conan", "All of these"], correct: 3 },
  { question: "Mitch Hedberg known for what style?", choices: ["One-liners", "Storytelling", "Political", "Observational long-form"], correct: 0 },
  { question: "Mitch Hedberg died in?", choices: ["2003", "2005", "2007", "2009"], correct: 1 },
  { question: "Steven Wright known for?", choices: ["Deadpan one-liners", "Rants", "Songs", "Impressions"], correct: 0 },
  { question: "Sarah Silverman album 'Jesus Is Magic' year?", choices: ["2003", "2005", "2007", "2009"], correct: 1 },
  { question: "Louis CK's cancelled-then-revived special 'Sincerely' year?", choices: ["2018", "2020", "2021", "2022"], correct: 2 },
  { question: "Patrice O'Neal died in?", choices: ["2009", "2011", "2013", "2015"], correct: 1 },
  { question: "Patton Oswalt won Emmy for?", choices: ["Talking for Clapping", "Annihilation", "I Love Everything", "Werewolves and Lollipops"], correct: 0 },
  { question: "Ali Wong's most famous Netflix special?", choices: ["Baby Cobra", "Hard Knock Wife", "Don Wong", "Beef"], correct: 0 },
  { question: "John Mulaney's first major Netflix special?", choices: ["The Comeback Kid", "Kid Gorgeous", "New in Town", "Baby J"], correct: 0 },
  { question: "Hannibal Buress is known for outing what celeb in 2014?", choices: ["Bill Cosby", "Louis CK", "R. Kelly", "Charlie Sheen"], correct: 0 },
  { question: "Ricky Gervais hosted Golden Globes how many times?", choices: ["2", "3", "5", "7"], correct: 2 },
  { question: "Mike Birbiglia known for?", choices: ["Storytelling shows", "One-liners", "Political", "Crowd work"], correct: 0 },
  { question: "Marc Maron's podcast?", choices: ["WTF", "Comedy Bang Bang", "2 Bears 1 Cave", "Pete Holmes"], correct: 0 },
  { question: "Bo Burnham's pandemic special?", choices: ["Inside", "Make Happy", "what.", "Eighth Grade"], correct: 0 },
  { question: "Jerry Seinfeld's stand-up Netflix special?", choices: ["23 Hours to Kill", "Comedians in Cars", "Halftime", "I'm Telling You for the Last Time"], correct: 0 },
  { question: "Dane Cook's biggest stand-up special?", choices: ["Retaliation", "Vicious Circle", "Harmful If Swallowed", "Isolated Incident"], correct: 0 },
  { question: "Wanda Sykes joined Roseanne reboot?", choices: ["No", "Yes (writer)", "Cameo", "Co-star"], correct: 0 },
  { question: "Maria Bamford TV show on Netflix?", choices: ["Lady Dynamite", "One Mississippi", "Master of None", "Pretend It's a City"], correct: 0 },
  { question: "Norm Macdonald died in?", choices: ["2019", "2020", "2021", "2022"], correct: 2 },
  { question: "Norm hosted Weekend Update from?", choices: ["1992-1995", "1994-1998", "1996-2000", "1998-2002"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StandUpComedyQuizSettings): StandUpComedyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StandUpComedyQuizState, action: StandUpComedyQuizAction): StandUpComedyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StandUpComedyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
