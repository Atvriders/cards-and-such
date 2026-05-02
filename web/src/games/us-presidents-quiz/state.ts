import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface UsPresidentsQuizSettings { questions: "10" | "20" | "30"; }
export interface UsPresidentsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type UsPresidentsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "First US President?", choices: ["Adams", "Washington", "Jefferson", "Madison"], correct: 1, explanation: "George Washington was unanimously elected and served two terms (1789-1797)." },
  { question: "Author of the Declaration of Independence?", choices: ["Adams", "Madison", "Jefferson", "Franklin"], correct: 2, explanation: "Thomas Jefferson drafted it in June 1776; it was adopted on July 4, 1776." },
  { question: "Lincoln was the ___ president?", choices: ["14th", "15th", "16th", "17th"], correct: 2, explanation: "Abraham Lincoln served as the 16th president from 1861 until his assassination in 1865." },
  { question: "FDR served how many terms?", choices: ["Two", "Three", "Four", "Five"], correct: 2, explanation: "FDR was elected four times (1932, 36, 40, 44); the 22nd Amendment later capped presidents at two terms." },
  { question: "JFK was assassinated in?", choices: ["Dallas", "Houston", "Memphis", "Los Angeles"], correct: 0, explanation: "Kennedy was shot in Dallas, Texas on November 22, 1963 by Lee Harvey Oswald." },
  { question: "Truman authorized atomic bombs on?", choices: ["Pearl Harbor", "Tokyo & Kyoto", "Hiroshima & Nagasaki", "Berlin & Hamburg"], correct: 2, explanation: "The atomic bombs dropped on Hiroshima (Aug 6) and Nagasaki (Aug 9) in 1945 ended WWII." },
  { question: "Reagan was president from?", choices: ["1977-1981", "1981-1989", "1985-1993", "1989-1993"], correct: 1, explanation: "Ronald Reagan, the 40th president, served two terms from January 1981 to January 1989." },
  { question: "Obama took office in?", choices: ["2005", "2009", "2013", "2017"], correct: 1, explanation: "Barack Obama was inaugurated on January 20, 2009 after defeating John McCain." },
  { question: "First African-American president?", choices: ["Lincoln", "Carter", "Obama", "Biden"], correct: 2, explanation: "Barack Obama broke the racial barrier with his 2008 election as the 44th president." },
  { question: "Nixon resigned over?", choices: ["Iran-Contra", "Watergate", "Vietnam", "Whitewater"], correct: 1, explanation: "Watergate, the 1972 break-in at DNC headquarters and subsequent cover-up, forced Nixon's 1974 resignation." },
  { question: "JFK's Vice President?", choices: ["Humphrey", "LBJ", "Carter", "Mondale"], correct: 1, explanation: "Lyndon B. Johnson (LBJ) succeeded Kennedy after his assassination and was elected in his own right in 1964." },
  { question: "Carter was president?", choices: ["1973-1977", "1977-1981", "1981-1985", "1969-1973"], correct: 1, explanation: "Jimmy Carter, the 39th president, served from January 1977 to January 1981." },
  { question: "Eisenhower commanded D-Day in?", choices: ["1942", "1944", "1945", "1943"], correct: 1, explanation: "As Supreme Allied Commander, Ike led the Normandy invasion on June 6, 1944." },
  { question: "First president to be impeached?", choices: ["Lincoln", "Andrew Johnson", "Grant", "Hayes"], correct: 1, explanation: "Andrew Johnson was impeached in 1868 over Reconstruction policy; he was acquitted by one Senate vote." },
  { question: "Clinton was impeached in?", choices: ["1995", "1998", "2001", "2003"], correct: 1, explanation: "Bill Clinton was impeached in December 1998 over the Lewinsky affair; the Senate acquitted him in 1999." },
  { question: "Trump was the ___ president?", choices: ["43rd", "44th", "45th", "46th"], correct: 2, explanation: "Donald Trump served as the 45th president from 2017 to 2021." },
  { question: "Biden was VP under?", choices: ["Bush", "Obama", "Clinton", "Carter"], correct: 1, explanation: "Joe Biden served as Obama's Vice President for both terms (2009-2017)." },
  { question: "Washington's home was?", choices: ["Monticello", "Mount Vernon", "Hyde Park", "Hermitage"], correct: 1, explanation: "Mount Vernon is Washington's plantation estate on the Potomac in Virginia." },
  { question: "Jefferson's home was?", choices: ["Mount Vernon", "Monticello", "Hyde Park", "Hermitage"], correct: 1, explanation: "Monticello, Jefferson's neoclassical home near Charlottesville, is a UNESCO World Heritage site." },
  { question: "Andrew Jackson's nickname?", choices: ["Old Hickory", "Old Rough", "Honest Abe", "Tippecanoe"], correct: 0, explanation: "'Old Hickory' came from his soldiers in the War of 1812 who said he was tough as hickory wood." },
  { question: "Wilson led US into?", choices: ["WWI", "WWII", "Korea", "Vietnam"], correct: 0, explanation: "Woodrow Wilson took the US into World War I in April 1917 after German submarine attacks." },
  { question: "Hoover was president during?", choices: ["Crash of 1929", "WW1", "WW2", "Korean War"], correct: 0, explanation: "Herbert Hoover took office in March 1929; the stock market crashed seven months later in October." },
  { question: "Ford pardoned?", choices: ["Nixon", "Carter", "Agnew", "Reagan"], correct: 0, explanation: "Gerald Ford controversially pardoned Richard Nixon for any Watergate-related crimes on September 8, 1974." },
  { question: "George H.W. Bush led?", choices: ["Vietnam", "Gulf War", "Korean War", "Iraq War"], correct: 1, explanation: "Bush 41 led the coalition in Operation Desert Storm (1991) to liberate Kuwait from Iraq." },
  { question: "Lincoln was assassinated by?", choices: ["Booth", "Oswald", "Czolgosz", "Guiteau"], correct: 0, explanation: "John Wilkes Booth, an actor and Confederate sympathizer, shot Lincoln at Ford's Theatre on April 14, 1865." },
  { question: "Garfield was assassinated by?", choices: ["Booth", "Oswald", "Czolgosz", "Guiteau"], correct: 3, explanation: "Charles Guiteau shot Garfield in 1881; the assassination spurred civil service reform." },
  { question: "Only president to resign?", choices: ["Ford", "Nixon", "Johnson", "Carter"], correct: 1, explanation: "Richard Nixon resigned on August 9, 1974 to avoid certain impeachment over Watergate." },
  { question: "Only unmarried president?", choices: ["Buchanan", "Polk", "Pierce", "Tyler"], correct: 0, explanation: "James Buchanan, the 15th president, never married; his niece served as White House hostess." },
  { question: "Roosevelt's New Deal addressed?", choices: ["Cold War", "Great Depression", "Civil Rights", "WWI"], correct: 1, explanation: "FDR's New Deal (1933-1939) was a sweeping program of relief, recovery, and reform during the Great Depression." },
  { question: "Truman Doctrine aimed to contain?", choices: ["Fascism", "Communism", "Imperialism", "Terrorism"], correct: 1, explanation: "Announced in 1947, the Truman Doctrine pledged US support to nations threatened by Soviet communism." },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: UsPresidentsQuizSettings): UsPresidentsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: UsPresidentsQuizState, action: UsPresidentsQuizAction): UsPresidentsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: UsPresidentsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
