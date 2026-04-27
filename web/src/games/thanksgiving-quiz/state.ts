import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ThanksgivingQuizSettings { questions: "10" | "20" | "30"; }
export interface ThanksgivingQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ThanksgivingQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "First Thanksgiving was held at?",
    "choices": [
      "Jamestown",
      "Plymouth",
      "Boston",
      "Salem"
    ],
    "correct": 1
  },
  {
    "question": "First Thanksgiving year?",
    "choices": [
      "1607",
      "1620",
      "1621",
      "1630"
    ],
    "correct": 2
  },
  {
    "question": "Pilgrims celebrated with which Native peoples?",
    "choices": [
      "Mohawk",
      "Iroquois",
      "Wampanoag",
      "Cherokee"
    ],
    "correct": 2
  },
  {
    "question": "Sarah Josepha Hale lobbied for Thanksgiving as?",
    "choices": [
      "A meal",
      "A national holiday",
      "A school holiday",
      "A church day"
    ],
    "correct": 1
  },
  {
    "question": "Lincoln declared Thanksgiving national in?",
    "choices": [
      "1860",
      "1863",
      "1865",
      "1869"
    ],
    "correct": 1
  },
  {
    "question": "Macy's parade started in?",
    "choices": [
      "1920",
      "1924",
      "1929",
      "1934"
    ],
    "correct": 1
  },
  {
    "question": "Thanksgiving falls on which Thursday?",
    "choices": [
      "Third",
      "Fourth",
      "First",
      "Last"
    ],
    "correct": 1
  },
  {
    "question": "Most-eaten bird?",
    "choices": [
      "Chicken",
      "Duck",
      "Turkey",
      "Goose"
    ],
    "correct": 2
  },
  {
    "question": "Cranberry sauce origin?",
    "choices": [
      "Native American",
      "British",
      "Spanish",
      "Italian"
    ],
    "correct": 0
  },
  {
    "question": "'Black Friday' is the day after?",
    "choices": [
      "Christmas",
      "Halloween",
      "Thanksgiving",
      "Easter"
    ],
    "correct": 2
  },
  {
    "question": "What is 'turducken'?",
    "choices": [
      "Stuffed turkey",
      "Turkey-duck-chicken",
      "Turkey-duck-quail",
      "Turkey-duck"
    ],
    "correct": 1
  },
  {
    "question": "Canada celebrates Thanksgiving in?",
    "choices": [
      "September",
      "October",
      "November",
      "December"
    ],
    "correct": 1
  },
  {
    "question": "Which president pardoned the first turkey traditionally?",
    "choices": [
      "Lincoln",
      "Truman",
      "Kennedy",
      "Reagan"
    ],
    "correct": 1
  },
  {
    "question": "Plymouth Rock is in?",
    "choices": [
      "Maine",
      "Massachusetts",
      "Rhode Island",
      "Connecticut"
    ],
    "correct": 1
  },
  {
    "question": "Squanto helped pilgrims by?",
    "choices": [
      "Teaching agriculture",
      "Giving them weapons",
      "Teaching English",
      "Teaching navigation"
    ],
    "correct": 0
  },
  {
    "question": "The 'Three Sisters' crops are?",
    "choices": [
      "Corn, beans, squash",
      "Rice, beans, corn",
      "Wheat, oats, barley",
      "Yams, peas, corn"
    ],
    "correct": 0
  },
  {
    "question": "Pumpkin pie became popular in?",
    "choices": [
      "17th century",
      "18th century",
      "19th century",
      "20th century"
    ],
    "correct": 2
  },
  {
    "question": "Mayflower departed from?",
    "choices": [
      "London",
      "Plymouth (England)",
      "Southampton",
      "Liverpool"
    ],
    "correct": 1
  },
  {
    "question": "How many pilgrims arrived on Mayflower?",
    "choices": [
      "50",
      "75",
      "102",
      "150"
    ],
    "correct": 2
  },
  {
    "question": "First documented Thanksgiving in North America?",
    "choices": [
      "Plymouth 1621",
      "Berkeley 1619",
      "St. Augustine 1565",
      "Roanoke 1586"
    ],
    "correct": 2
  },
  {
    "question": "Wishbone tradition originated with?",
    "choices": [
      "Etruscans",
      "Greeks",
      "Egyptians",
      "Celts"
    ],
    "correct": 0
  },
  {
    "question": "First Thanksgiving Day football game year?",
    "choices": [
      "1876",
      "1880",
      "1900",
      "1920"
    ],
    "correct": 0
  },
  {
    "question": "FDR moved Thanksgiving to?",
    "choices": [
      "Boost retail",
      "Honor veterans",
      "Aid farmers",
      "Avoid storms"
    ],
    "correct": 0
  },
  {
    "question": "What is the name of NYC's parade?",
    "choices": [
      "Macy's",
      "Gimbels'",
      "Hudson's",
      "Saks'"
    ],
    "correct": 0
  },
  {
    "question": "Which dish is most regional / Southern?",
    "choices": [
      "Cornbread stuffing",
      "Mashed potatoes",
      "Green bean casserole",
      "Yams"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ThanksgivingQuizSettings): ThanksgivingQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ThanksgivingQuizState, action: ThanksgivingQuizAction): ThanksgivingQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ThanksgivingQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
