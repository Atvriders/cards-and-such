import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface GirlGroupsQuizSettings { questions: "10" | "20" | "30"; }
export interface GirlGroupsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type GirlGroupsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "The Supremes' lead singer was?",
    "choices": [
      "Diana Ross",
      "Florence Ballard",
      "Mary Wilson",
      "Cindy Birdsong"
    ],
    "correct": 0
  },
  {
    "question": "The Supremes were signed to which label?",
    "choices": [
      "Motown",
      "Atlantic",
      "Stax",
      "Columbia"
    ],
    "correct": 0
  },
  {
    "question": "The Spice Girls formed in?",
    "choices": [
      "UK",
      "USA",
      "Ireland",
      "Australia"
    ],
    "correct": 0
  },
  {
    "question": "'Wannabe' was released in?",
    "choices": [
      "1994",
      "1996",
      "1998",
      "2000"
    ],
    "correct": 1
  },
  {
    "question": "Which Spice Girl was 'Sporty'?",
    "choices": [
      "Mel C",
      "Mel B",
      "Emma Bunton",
      "Geri Halliwell"
    ],
    "correct": 0
  },
  {
    "question": "Destiny's Child's lead singer became?",
    "choices": [
      "Beyonce",
      "Kelly Rowland",
      "Michelle Williams",
      "LeToya Luckett"
    ],
    "correct": 0
  },
  {
    "question": "'Survivor' was a hit by?",
    "choices": [
      "Destiny's Child",
      "TLC",
      "En Vogue",
      "SWV"
    ],
    "correct": 0
  },
  {
    "question": "TLC's 'Waterfalls' was released in?",
    "choices": [
      "1992",
      "1994",
      "1995",
      "1997"
    ],
    "correct": 2
  },
  {
    "question": "Lisa 'Left Eye' Lopes was a member of?",
    "choices": [
      "TLC",
      "En Vogue",
      "SWV",
      "Xscape"
    ],
    "correct": 0
  },
  {
    "question": "Salt-N-Pepa hailed from?",
    "choices": [
      "New York",
      "Los Angeles",
      "Atlanta",
      "Miami"
    ],
    "correct": 0
  },
  {
    "question": "'Push It' was by?",
    "choices": [
      "Salt-N-Pepa",
      "TLC",
      "En Vogue",
      "SWV"
    ],
    "correct": 0
  },
  {
    "question": "En Vogue's debut album was?",
    "choices": [
      "Born to Sing",
      "Funky Divas",
      "EV3",
      "Soul Flower"
    ],
    "correct": 0
  },
  {
    "question": "The Pussycat Dolls were originally a?",
    "choices": [
      "Burlesque troupe",
      "Dance crew",
      "Choir",
      "Reality show group"
    ],
    "correct": 0
  },
  {
    "question": "'Don't Cha' was by the Pussycat Dolls in?",
    "choices": [
      "2003",
      "2005",
      "2007",
      "2009"
    ],
    "correct": 1
  },
  {
    "question": "Little Mix formed on which TV show?",
    "choices": [
      "The X Factor UK",
      "American Idol",
      "The Voice",
      "Pop Idol"
    ],
    "correct": 0
  },
  {
    "question": "Little Mix won The X Factor in?",
    "choices": [
      "2009",
      "2011",
      "2013",
      "2015"
    ],
    "correct": 1
  },
  {
    "question": "Fifth Harmony formed on?",
    "choices": [
      "The X Factor US",
      "American Idol",
      "The Voice",
      "America's Got Talent"
    ],
    "correct": 0
  },
  {
    "question": "'Worth It' was by Fifth Harmony in?",
    "choices": [
      "2013",
      "2015",
      "2017",
      "2019"
    ],
    "correct": 1
  },
  {
    "question": "BLACKPINK debuted in?",
    "choices": [
      "2014",
      "2016",
      "2018",
      "2020"
    ],
    "correct": 1
  },
  {
    "question": "BLACKPINK's label is?",
    "choices": [
      "YG",
      "SM",
      "JYP",
      "HYBE"
    ],
    "correct": 0
  },
  {
    "question": "TWICE debuted under which agency?",
    "choices": [
      "JYP",
      "SM",
      "YG",
      "Big Hit"
    ],
    "correct": 0
  },
  {
    "question": "Girls' Generation debuted in?",
    "choices": [
      "2005",
      "2007",
      "2009",
      "2011"
    ],
    "correct": 1
  },
  {
    "question": "Girls' Generation's agency is?",
    "choices": [
      "SM Entertainment",
      "JYP",
      "YG",
      "Cube"
    ],
    "correct": 0
  },
  {
    "question": "'Gee' was by Girls' Generation in?",
    "choices": [
      "2007",
      "2009",
      "2011",
      "2013"
    ],
    "correct": 1
  },
  {
    "question": "The Bangles' 'Walk Like an Egyptian' was a hit in?",
    "choices": [
      "1984",
      "1986",
      "1988",
      "1990"
    ],
    "correct": 1
  },
  {
    "question": "The Go-Go's lead singer was?",
    "choices": [
      "Belinda Carlisle",
      "Jane Wiedlin",
      "Charlotte Caffey",
      "Kathy Valentine"
    ],
    "correct": 0
  },
  {
    "question": "'We Got the Beat' was by?",
    "choices": [
      "The Go-Go's",
      "The Bangles",
      "Bananarama",
      "The Runaways"
    ],
    "correct": 0
  },
  {
    "question": "Bananarama is from?",
    "choices": [
      "UK",
      "USA",
      "Australia",
      "Canada"
    ],
    "correct": 0
  },
  {
    "question": "The Ronettes' lead singer was?",
    "choices": [
      "Ronnie Spector",
      "Estelle Bennett",
      "Nedra Talley",
      "Darlene Love"
    ],
    "correct": 0
  },
  {
    "question": "'Be My Baby' was a hit for?",
    "choices": [
      "The Ronettes",
      "The Shirelles",
      "The Crystals",
      "The Marvelettes"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: GirlGroupsQuizSettings): GirlGroupsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: GirlGroupsQuizState, action: GirlGroupsQuizAction): GirlGroupsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: GirlGroupsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
