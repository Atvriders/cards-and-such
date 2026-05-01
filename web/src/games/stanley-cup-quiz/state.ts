import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StanleyCupQuizSettings { questions: "10" | "20" | "30"; }
export interface StanleyCupQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StanleyCupQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Which team has won the most Stanley Cups?",
    "choices": [
      "Canadiens",
      "Maple Leafs",
      "Red Wings",
      "Bruins"
    ],
    "correct": 0
  },
  {
    "question": "How many cups have the Montreal Canadiens won?",
    "choices": [
      "22",
      "23",
      "24",
      "25"
    ],
    "correct": 2
  },
  {
    "question": "Who is the all-time NHL goal scorer?",
    "choices": [
      "Gretzky",
      "Ovechkin",
      "Howe",
      "Lemieux"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2024 Stanley Cup?",
    "choices": [
      "Panthers",
      "Oilers",
      "Knights",
      "Bruins"
    ],
    "correct": 0
  },
  {
    "question": "Who is 'The Great One'?",
    "choices": [
      "Gretzky",
      "Lemieux",
      "Crosby",
      "Ovechkin"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2023 Stanley Cup?",
    "choices": [
      "Golden Knights",
      "Panthers",
      "Avalanche",
      "Lightning"
    ],
    "correct": 0
  },
  {
    "question": "Which team won back-to-back Cups in 2020 and 2021?",
    "choices": [
      "Lightning",
      "Avalanche",
      "Bruins",
      "Canadiens"
    ],
    "correct": 0
  },
  {
    "question": "Who captained the 2010 Blackhawks championship?",
    "choices": [
      "Toews",
      "Kane",
      "Hossa",
      "Sharp"
    ],
    "correct": 0
  },
  {
    "question": "Which Russian player led the Capitals to 2018?",
    "choices": [
      "Ovechkin",
      "Kuznetsov",
      "Backstrom",
      "Holtby"
    ],
    "correct": 0
  },
  {
    "question": "In which year did the Rangers last win the Cup?",
    "choices": [
      "1994",
      "1996",
      "1990",
      "2000"
    ],
    "correct": 0
  },
  {
    "question": "Who scored the 1994 Cup-winning goal for the Rangers?",
    "choices": [
      "Mark Messier",
      "Brian Leetch",
      "Stephane Matteau",
      "Mike Richter"
    ],
    "correct": 0
  },
  {
    "question": "How many wins are needed to take a playoff series?",
    "choices": [
      "3",
      "4",
      "5",
      "7"
    ],
    "correct": 1
  },
  {
    "question": "Which trophy goes to the playoff MVP?",
    "choices": [
      "Conn Smythe",
      "Hart",
      "Vezina",
      "Norris"
    ],
    "correct": 0
  },
  {
    "question": "Sidney Crosby plays for which team?",
    "choices": [
      "Penguins",
      "Capitals",
      "Flyers",
      "Devils"
    ],
    "correct": 0
  },
  {
    "question": "How many Stanley Cups did Wayne Gretzky win?",
    "choices": [
      "3",
      "4",
      "5",
      "6"
    ],
    "correct": 1
  },
  {
    "question": "Who are the 'Original Six'?",
    "choices": [
      "The six oldest NHL teams",
      "Six US teams",
      "Six Canadian teams",
      "Six expansion teams"
    ],
    "correct": 0
  },
  {
    "question": "Who is the oldest player to score a Cup-winning goal?",
    "choices": [
      "Lanny McDonald",
      "Gordie Howe",
      "Mark Recchi",
      "Chris Chelios"
    ],
    "correct": 0
  },
  {
    "question": "Which team won 4 straight Cups in the early 1980s?",
    "choices": [
      "Islanders",
      "Oilers",
      "Canadiens",
      "Flyers"
    ],
    "correct": 0
  },
  {
    "question": "Who scored 92 goals in a single NHL season?",
    "choices": [
      "Gretzky",
      "Lemieux",
      "Hull",
      "Ovechkin"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2022 Stanley Cup?",
    "choices": [
      "Avalanche",
      "Lightning",
      "Rangers",
      "Oilers"
    ],
    "correct": 0
  },
  {
    "question": "Who was the 2022 Conn Smythe winner?",
    "choices": [
      "Cale Makar",
      "Nathan MacKinnon",
      "Mikko Rantanen",
      "Darcy Kuemper"
    ],
    "correct": 0
  },
  {
    "question": "Which team did the Panthers beat in the 2024 Cup Final?",
    "choices": [
      "Oilers",
      "Rangers",
      "Stars",
      "Hurricanes"
    ],
    "correct": 0
  },
  {
    "question": "How long is a Stanley Cup Final series?",
    "choices": [
      "Best of 5",
      "Best of 7",
      "Best of 9",
      "Best of 3"
    ],
    "correct": 1
  },
  {
    "question": "Who was the first European captain to win a Stanley Cup?",
    "choices": [
      "Lidstrom",
      "Sundin",
      "Forsberg",
      "Selanne"
    ],
    "correct": 0
  },
  {
    "question": "Which team relocated and became the Carolina Hurricanes?",
    "choices": [
      "Hartford Whalers",
      "Quebec Nordiques",
      "Minnesota North Stars",
      "Winnipeg Jets"
    ],
    "correct": 0
  },
  {
    "question": "Who did Pittsburgh draft 1st overall in 2005?",
    "choices": [
      "Crosby",
      "Malkin",
      "Staal",
      "Fleury"
    ],
    "correct": 0
  },
  {
    "question": "Which team won the 2017 Cup?",
    "choices": [
      "Penguins",
      "Predators",
      "Capitals",
      "Senators"
    ],
    "correct": 0
  },
  {
    "question": "Who was Lightning captain for the 2020/2021 Cups?",
    "choices": [
      "Stamkos",
      "Hedman",
      "Kucherov",
      "Vasilevskiy"
    ],
    "correct": 0
  },
  {
    "question": "Which trophy goes to the top regular-season team?",
    "choices": [
      "Presidents' Trophy",
      "Stanley Cup",
      "Hart",
      "Calder"
    ],
    "correct": 0
  },
  {
    "question": "Where is the Hockey Hall of Fame located?",
    "choices": [
      "Toronto",
      "Montreal",
      "Detroit",
      "Ottawa"
    ],
    "correct": 0
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StanleyCupQuizSettings): StanleyCupQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const qs=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s2=shuffle(idx,rng);const nc=s2.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s2.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions:qs,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StanleyCupQuizState, action: StanleyCupQuizAction): StanleyCupQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StanleyCupQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
