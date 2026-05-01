import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OscarFilmsQuizSettings { questions: "10" | "20" | "30"; }
export interface OscarFilmsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OscarFilmsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the first film to win Best Picture (1929)?", choices: ["Wings","Sunrise","The Jazz Singer","All Quiet"], correct: 0 },
  { question: "What 1939 film won Best Picture?", choices: ["Gone with the Wind","Wizard of Oz","Mr. Smith Goes to Washington","Stagecoach"], correct: 0 },
  { question: "What 1972 film won Best Picture?", choices: ["The Godfather","The Sting","Jaws","Cabaret"], correct: 0 },
  { question: "What 1974 film won Best Picture (Godfather sequel)?", choices: ["The Godfather Part II","Chinatown","Lenny","The Towering Inferno"], correct: 0 },
  { question: "What 1994 film won Best Picture?", choices: ["Forrest Gump","Pulp Fiction","Shawshank","Quiz Show"], correct: 0 },
  { question: "What film with Cuba Gooding Jr. (Oscar 1997)?", choices: ["Jerry Maguire","Boyz in the Hood","As Good As It Gets","Independence Day"], correct: 0 },
  { question: "What 1997 film won 11 Oscars including Best Picture?", choices: ["Titanic","LA Confidential","Good Will Hunting","Boogie Nights"], correct: 0 },
  { question: "How many Oscars did Titanic win, tied with Ben Hur and LOTR Return of the King?", choices: ["11","9","13","8"], correct: 0 },
  { question: "What 2003 LOTR film won Best Picture?", choices: ["Return of the King","Two Towers","Fellowship","All three nominated"], correct: 0 },
  { question: "What 2008 film won Best Picture?", choices: ["Slumdog Millionaire","The Reader","Frost/Nixon","Milk"], correct: 0 },
  { question: "What 2009 film won Best Picture?", choices: ["The Hurt Locker","Avatar","Inglourious Basterds","Up"], correct: 0 },
  { question: "Who became first female Best Director?", choices: ["Kathryn Bigelow","Jane Campion","Greta Gerwig","Sofia Coppola"], correct: 0 },
  { question: "What 2013 film won Best Picture?", choices: ["12 Years a Slave","Gravity","American Hustle","Her"], correct: 0 },
  { question: "What 2016 film won Best Picture (Moonlight upset)?", choices: ["Moonlight","La La Land","Manchester by the Sea","Lion"], correct: 0 },
  { question: "What 2019 film became first non-English Best Picture?", choices: ["Parasite","Roma","1917","Joker"], correct: 0 },
  { question: "What 2020 film won Best Picture?", choices: ["Nomadland","The Father","Promising Young Woman","Mank"], correct: 0 },
  { question: "What 2021 film won Best Picture?", choices: ["CODA","Belfast","Power of the Dog","West Side Story"], correct: 0 },
  { question: "What 2022 film won Best Picture?", choices: ["Everything Everywhere All at Once","The Banshees of Inisherin","Top Gun: Maverick","All Quiet"], correct: 0 },
  { question: "Who's the most-nominated actress?", choices: ["Meryl Streep","Katharine Hepburn","Bette Davis","Jane Fonda"], correct: 0 },
  { question: "How many Best Actress wins does Katharine Hepburn have?", choices: ["4","2","3","5"], correct: 0 },
  { question: "Who won Best Actor for The Godfather?", choices: ["Marlon Brando","Al Pacino","James Caan","Robert Duvall"], correct: 0 },
  { question: "Who won Best Actor for One Flew Over the Cuckoo's Nest?", choices: ["Jack Nicholson","Louise Fletcher (Best Actress)","Both","Just Nicholson"], correct: 0 },
  { question: "What 1991 film swept top 5 Oscars?", choices: ["Silence of the Lambs","Bugsy","JFK","Beauty and the Beast"], correct: 0 },
  { question: "Who won Best Actor for Silence of the Lambs?", choices: ["Anthony Hopkins","Jodie Foster (Actress)","Both","Just Hopkins"], correct: 0 },
  { question: "Who won Best Director for Schindler's List?", choices: ["Steven Spielberg","James Cameron","Robert Zemeckis","Quentin Tarantino"], correct: 0 },
  { question: "How many films are nominated for Best Picture (current)?", choices: ["10","5","7","9"], correct: 0 },
  { question: "What film won Best Animated Feature in 2002 (first year)?", choices: ["Shrek","Monsters Inc","Jimmy Neutron","Toy Story"], correct: 0 },
  { question: "What's the only foreign film besides Parasite to win BP (none have)?", choices: ["None - Parasite was first","Roma","Crouching Tiger","Life is Beautiful"], correct: 0 },
  { question: "What film won Best Picture in 1996 (Mel Gibson)?", choices: ["Braveheart","Apollo 13","Sense and Sensibility","Babe"], correct: 0 },
  { question: "Who hosted Oscars most times?", choices: ["Bob Hope","Billy Crystal","Johnny Carson","Whoopi Goldberg"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OscarFilmsQuizSettings): OscarFilmsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OscarFilmsQuizState, action: OscarFilmsQuizAction): OscarFilmsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OscarFilmsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
