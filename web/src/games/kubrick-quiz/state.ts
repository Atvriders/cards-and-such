import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface KubrickQuizSettings { questions: "10" | "20" | "30"; }
export interface KubrickQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type KubrickQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who directed '2001: A Space Odyssey'?", choices: ["Stanley Kubrick", "Steven Spielberg", "George Lucas", "Ridley Scott"], correct: 0 },
  { question: "What year was Stanley Kubrick born?", choices: ["1924", "1928", "1932", "1936"], correct: 1 },
  { question: "Where was Kubrick born?", choices: ["The Bronx, New York", "Manhattan", "Brooklyn", "Queens"], correct: 0 },
  { question: "Which novelist co-wrote '2001: A Space Odyssey' screenplay with Kubrick?", choices: ["Arthur C. Clarke", "Isaac Asimov", "Ray Bradbury", "Philip K. Dick"], correct: 0 },
  { question: "What 1971 film stars Malcolm McDowell as Alex DeLarge?", choices: ["A Clockwork Orange", "Barry Lyndon", "The Shining", "Eyes Wide Shut"], correct: 0 },
  { question: "Who plays Jack Torrance in 'The Shining' (1980)?", choices: ["Jack Nicholson", "Robert De Niro", "Al Pacino", "Dustin Hoffman"], correct: 0 },
  { question: "The Shining is based on a novel by?", choices: ["Stephen King", "Peter Straub", "Dean Koontz", "Clive Barker"], correct: 0 },
  { question: "What hotel features in 'The Shining'?", choices: ["The Overlook", "The Outlook", "The Lookout", "The Highlands"], correct: 0 },
  { question: "What 1964 nuclear war satire did Kubrick direct?", choices: ["Dr. Strangelove", "Fail-Safe", "On the Beach", "WarGames"], correct: 0 },
  { question: "Peter Sellers played how many roles in 'Dr. Strangelove'?", choices: ["Three", "Two", "Four", "Five"], correct: 0 },
  { question: "What 1987 Vietnam War film did Kubrick direct?", choices: ["Full Metal Jacket", "Platoon", "Hamburger Hill", "Apocalypse Now"], correct: 0 },
  { question: "Drill instructor in 'Full Metal Jacket' is named?", choices: ["Gunnery Sergeant Hartman", "Sergeant Slaughter", "Captain Willard", "Lt. Lockhart"], correct: 0 },
  { question: "Who plays Hartman in Full Metal Jacket?", choices: ["R. Lee Ermey", "Lou Gossett Jr.", "Sam Elliott", "Tom Berenger"], correct: 0 },
  { question: "What 1975 period film was based on a Thackeray novel?", choices: ["Barry Lyndon", "Lolita", "Spartacus", "Eyes Wide Shut"], correct: 0 },
  { question: "What special lenses did Kubrick use for candlelit scenes in 'Barry Lyndon'?", choices: ["NASA Zeiss f/0.7", "Canon f/1.0", "Leica Summilux", "Nikon Noct"], correct: 0 },
  { question: "Kubrick's final film, released in 1999, is?", choices: ["Eyes Wide Shut", "AI Artificial Intelligence", "The Shining", "Full Metal Jacket"], correct: 0 },
  { question: "Who stars in 'Eyes Wide Shut'?", choices: ["Tom Cruise and Nicole Kidman", "Tom Hanks and Meg Ryan", "Brad Pitt and Jennifer Aniston", "Sean Penn and Madonna"], correct: 0 },
  { question: "'Spartacus' (1960) was directed by Kubrick when?", choices: ["Replacing Anthony Mann mid-production", "From the start", "As co-director", "After Mann finished"], correct: 0 },
  { question: "Who stars as Spartacus?", choices: ["Kirk Douglas", "Charlton Heston", "Burt Lancaster", "Yul Brynner"], correct: 0 },
  { question: "What 1962 Kubrick adaptation stars James Mason as Humbert Humbert?", choices: ["Lolita", "Barry Lyndon", "The Killing", "Paths of Glory"], correct: 0 },
  { question: "What 1957 Kubrick WWI film stars Kirk Douglas?", choices: ["Paths of Glory", "Spartacus", "Killer's Kiss", "The Killing"], correct: 0 },
  { question: "What is the name of HAL 9000's company in 2001?", choices: ["No specific corp; built by IBM-like fictional company", "Cyberdyne", "OCP", "Yutani"], correct: 0 },
  { question: "What song does HAL sing as he is shut down?", choices: ["Daisy Bell", "Twinkle Twinkle", "Yankee Doodle", "Auld Lang Syne"], correct: 0 },
  { question: "What 'Dr. Strangelove' character rides the bomb?", choices: ["Major Kong", "President Muffley", "General Ripper", "Group Captain Mandrake"], correct: 0 },
  { question: "Kubrick was known for what level of perfectionism?", choices: ["Extreme; many takes per scene", "Loose and improvisational", "Single take only", "Average"], correct: 0 },
  { question: "How many Best Director Oscars did Kubrick win?", choices: ["Zero", "One", "Two", "Three"], correct: 0 },
  { question: "Kubrick won which Oscar for 2001?", choices: ["Visual Effects", "Best Director", "Best Picture", "Best Screenplay"], correct: 0 },
  { question: "What number room is haunted in 'The Shining'?", choices: ["237", "217", "423", "100"], correct: 0 },
  { question: "Kubrick lived primarily in which country in his later years?", choices: ["England", "United States", "France", "Germany"], correct: 0 },
  { question: "Kubrick died in?", choices: ["1999", "2001", "1995", "2003"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: KubrickQuizSettings): KubrickQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: KubrickQuizState, action: KubrickQuizAction): KubrickQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: KubrickQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
