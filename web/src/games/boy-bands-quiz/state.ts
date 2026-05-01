import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BoyBandsQuizSettings { questions: "10" | "20" | "30"; }
export interface BoyBandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BoyBandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Backstreet Boys formed in which city?",
    "choices": [
      "Orlando",
      "New York",
      "Los Angeles",
      "Boston"
    ],
    "correct": 0
  },
  {
    "question": "NSYNC's lead vocalists included Justin Timberlake and?",
    "choices": [
      "JC Chasez",
      "Lance Bass",
      "Joey Fatone",
      "Chris Kirkpatrick"
    ],
    "correct": 0
  },
  {
    "question": "Boyz II Men hails from?",
    "choices": [
      "Philadelphia",
      "Detroit",
      "Atlanta",
      "New York"
    ],
    "correct": 0
  },
  {
    "question": "New Kids on the Block formed in?",
    "choices": [
      "Boston",
      "New York",
      "Los Angeles",
      "Orlando"
    ],
    "correct": 0
  },
  {
    "question": "Take That originally hailed from?",
    "choices": [
      "UK",
      "USA",
      "Ireland",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "Westlife formed in which country?",
    "choices": [
      "Ireland",
      "UK",
      "Australia",
      "USA"
    ],
    "correct": 0
  },
  {
    "question": "One Direction was formed on which TV show?",
    "choices": [
      "The X Factor",
      "American Idol",
      "The Voice",
      "Britain's Got Talent"
    ],
    "correct": 0
  },
  {
    "question": "One Direction formed in?",
    "choices": [
      "2008",
      "2010",
      "2012",
      "2014"
    ],
    "correct": 1
  },
  {
    "question": "BTS debuted in?",
    "choices": [
      "2011",
      "2013",
      "2015",
      "2017"
    ],
    "correct": 1
  },
  {
    "question": "BTS' agency is?",
    "choices": [
      "HYBE/Big Hit",
      "SM",
      "JYP",
      "YG"
    ],
    "correct": 0
  },
  {
    "question": "EXO debuted under which agency?",
    "choices": [
      "SM Entertainment",
      "JYP",
      "YG",
      "Big Hit"
    ],
    "correct": 0
  },
  {
    "question": "Big Bang debuted in?",
    "choices": [
      "2004",
      "2006",
      "2008",
      "2010"
    ],
    "correct": 1
  },
  {
    "question": "'I Want It That Way' was by?",
    "choices": [
      "Backstreet Boys",
      "NSYNC",
      "98 Degrees",
      "O-Town"
    ],
    "correct": 0
  },
  {
    "question": "'Bye Bye Bye' was by?",
    "choices": [
      "NSYNC",
      "Backstreet Boys",
      "BBMak",
      "LFO"
    ],
    "correct": 0
  },
  {
    "question": "Which boy band sang 'End of the Road'?",
    "choices": [
      "Boyz II Men",
      "Color Me Badd",
      "All-4-One",
      "Az Yet"
    ],
    "correct": 0
  },
  {
    "question": "Menudo was a long-running boy band from?",
    "choices": [
      "Puerto Rico",
      "Mexico",
      "Spain",
      "Cuba"
    ],
    "correct": 0
  },
  {
    "question": "Ricky Martin was famously a member of?",
    "choices": [
      "Menudo",
      "Boyz II Men",
      "Color Me Badd",
      "98 Degrees"
    ],
    "correct": 0
  },
  {
    "question": "New Edition's lead singer who went solo was?",
    "choices": [
      "Bobby Brown",
      "Ralph Tresvant",
      "Johnny Gill",
      "Michael Bivins"
    ],
    "correct": 0
  },
  {
    "question": "Bell Biv DeVoe was an offshoot of?",
    "choices": [
      "New Edition",
      "Jodeci",
      "Boyz II Men",
      "Color Me Badd"
    ],
    "correct": 0
  },
  {
    "question": "'MMMBop' was by?",
    "choices": [
      "Hanson",
      "Take 5",
      "Dream Street",
      "BBMak"
    ],
    "correct": 0
  },
  {
    "question": "'5ive' (Five) hailed from?",
    "choices": [
      "UK",
      "USA",
      "Ireland",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "Jonas Brothers' breakout label was?",
    "choices": [
      "Hollywood Records",
      "Disney",
      "Sony",
      "Universal"
    ],
    "correct": 0
  },
  {
    "question": "'Burnin' Up' was by?",
    "choices": [
      "Jonas Brothers",
      "One Direction",
      "The Wanted",
      "Big Time Rush"
    ],
    "correct": 0
  },
  {
    "question": "The Wanted's hit 'Glad You Came' was released in?",
    "choices": [
      "2009",
      "2011",
      "2013",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "Big Time Rush originated as a?",
    "choices": [
      "Nickelodeon TV series",
      "Disney TV series",
      "X Factor band",
      "YouTube band"
    ],
    "correct": 0
  },
  {
    "question": "BTS member who became known as 'World's Most Handsome' meme?",
    "choices": [
      "V",
      "Jin",
      "Jimin",
      "Jungkook"
    ],
    "correct": 1
  },
  {
    "question": "BLACKPINK is a girl group, but its label YG also manages which boy group?",
    "choices": [
      "iKON",
      "BTS",
      "NCT",
      "Stray Kids"
    ],
    "correct": 0
  },
  {
    "question": "NSYNC's Joey Fatone is known for hosting?",
    "choices": [
      "Family Feud spinoffs",
      "Top Chef",
      "The Voice",
      "American Idol"
    ],
    "correct": 0
  },
  {
    "question": "New Kids on the Block's biggest hit was?",
    "choices": [
      "Step by Step",
      "Hangin' Tough",
      "Both A and B",
      "I'll Be Loving You"
    ],
    "correct": 2
  },
  {
    "question": "Backstreet Boys' debut US album was titled?",
    "choices": [
      "Backstreet Boys",
      "Millennium",
      "Black & Blue",
      "Never Gone"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BoyBandsQuizSettings): BoyBandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BoyBandsQuizState, action: BoyBandsQuizAction): BoyBandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BoyBandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
