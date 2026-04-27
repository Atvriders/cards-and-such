import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SoccerStarsQuizSettings { questions: "10" | "20" | "30"; }
export interface SoccerStarsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SoccerStarsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "How many World Cups did Pelé win?",
    "choices": [
      "1",
      "2",
      "3",
      "4"
    ],
    "correct": 2
  },
  {
    "question": "Pelé played most of his club career at?",
    "choices": [
      "Santos",
      "Cosmos",
      "Flamengo",
      "Botafogo"
    ],
    "correct": 0
  },
  {
    "question": "Maradona played for which national team?",
    "choices": [
      "Argentina",
      "Brazil",
      "Uruguay",
      "Chile"
    ],
    "correct": 0
  },
  {
    "question": "Maradona's famous 1986 goal vs England is known as?",
    "choices": [
      "Hand of God",
      "Goal of the Century",
      "God's Goal",
      "Diego Pass"
    ],
    "correct": 0
  },
  {
    "question": "Lionel Messi has won how many Ballon d'Or awards (as of 2024)?",
    "choices": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correct": 2
  },
  {
    "question": "Who won the 2022 World Cup?",
    "choices": [
      "France",
      "Argentina",
      "Brazil",
      "Croatia"
    ],
    "correct": 1
  },
  {
    "question": "Cristiano Ronaldo's birth country?",
    "choices": [
      "Brazil",
      "Spain",
      "Portugal",
      "Argentina"
    ],
    "correct": 2
  },
  {
    "question": "Ronaldinho played mostly at?",
    "choices": [
      "Barcelona",
      "Real Madrid",
      "AC Milan",
      "PSG"
    ],
    "correct": 0
  },
  {
    "question": "Zinedine Zidane won the World Cup with?",
    "choices": [
      "France",
      "Italy",
      "Spain",
      "Brazil"
    ],
    "correct": 0
  },
  {
    "question": "Zidane's club glory was at?",
    "choices": [
      "Real Madrid",
      "Barcelona",
      "Juventus",
      "All three"
    ],
    "correct": 3
  },
  {
    "question": "Who is 'Der Kaiser'?",
    "choices": [
      "Beckenbauer",
      "Müller",
      "Klinsmann",
      "Matthäus"
    ],
    "correct": 0
  },
  {
    "question": "Who is England's all-time leading goalscorer (men)?",
    "choices": [
      "Bobby Charlton",
      "Wayne Rooney",
      "Harry Kane",
      "Gary Lineker"
    ],
    "correct": 2
  },
  {
    "question": "Bobby Charlton played for?",
    "choices": [
      "Manchester United",
      "Liverpool",
      "Arsenal",
      "Tottenham"
    ],
    "correct": 0
  },
  {
    "question": "Cruyff played mostly at Ajax and?",
    "choices": [
      "Barcelona",
      "Real Madrid",
      "PSV",
      "Inter"
    ],
    "correct": 0
  },
  {
    "question": "Total Football style is associated with?",
    "choices": [
      "Netherlands",
      "Italy",
      "England",
      "Argentina"
    ],
    "correct": 0
  },
  {
    "question": "How many Ballon d'Or has Ronaldo won (as of 2024)?",
    "choices": [
      "3",
      "5",
      "7",
      "8"
    ],
    "correct": 1
  },
  {
    "question": "Garrincha played for which country?",
    "choices": [
      "Brazil",
      "Argentina",
      "Uruguay",
      "Portugal"
    ],
    "correct": 0
  },
  {
    "question": "Who scored the World Cup 1966 final hat-trick for England?",
    "choices": [
      "Geoff Hurst",
      "Bobby Moore",
      "Bobby Charlton",
      "Roger Hunt"
    ],
    "correct": 0
  },
  {
    "question": "Bobby Moore captained England to a World Cup in?",
    "choices": [
      "1966",
      "1970",
      "1958",
      "1982"
    ],
    "correct": 0
  },
  {
    "question": "Eusébio played for which country?",
    "choices": [
      "Portugal",
      "Brazil",
      "Mozambique (born), Portugal (national)",
      "Spain"
    ],
    "correct": 2
  },
  {
    "question": "Iniesta scored the winning goal in which World Cup final?",
    "choices": [
      "2010",
      "2006",
      "2014",
      "2018"
    ],
    "correct": 0
  },
  {
    "question": "Spain's tiki-taka peak was around?",
    "choices": [
      "2008-2012",
      "2002-2006",
      "2014-2018",
      "1998-2002"
    ],
    "correct": 0
  },
  {
    "question": "Mbappe plays internationally for?",
    "choices": [
      "France",
      "Cameroon",
      "Algeria",
      "Senegal"
    ],
    "correct": 0
  },
  {
    "question": "Neymar plays for which country?",
    "choices": [
      "Brazil",
      "Argentina",
      "Portugal",
      "Spain"
    ],
    "correct": 0
  },
  {
    "question": "Buffon is a legendary?",
    "choices": [
      "Goalkeeper",
      "Defender",
      "Midfielder",
      "Striker"
    ],
    "correct": 0
  },
  {
    "question": "Beckenbauer led Germany to a World Cup as both player and?",
    "choices": [
      "Coach",
      "President",
      "Sponsor",
      "Owner"
    ],
    "correct": 0
  },
  {
    "question": "Modric won the Ballon d'Or in?",
    "choices": [
      "2018",
      "2016",
      "2014",
      "2012"
    ],
    "correct": 0
  },
  {
    "question": "Andres Iniesta and Xavi were the heart of which club's golden era?",
    "choices": [
      "Barcelona",
      "Real Madrid",
      "Bayern",
      "Juventus"
    ],
    "correct": 0
  },
  {
    "question": "Roberto Baggio missed a famous PK in which final?",
    "choices": [
      "1994 World Cup",
      "1998 World Cup",
      "Euro 1996",
      "Euro 2000"
    ],
    "correct": 0
  },
  {
    "question": "Cristiano Ronaldo's first European club?",
    "choices": [
      "Manchester United",
      "Sporting CP",
      "Real Madrid",
      "Juventus"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SoccerStarsQuizSettings): SoccerStarsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SoccerStarsQuizState, action: SoccerStarsQuizAction): SoccerStarsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SoccerStarsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
