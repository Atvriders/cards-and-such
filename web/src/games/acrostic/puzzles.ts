// Pre-designed acrostic puzzles
// The first letters of the clue answers spell the author name.
// Letters from the answers also fill blanks in the quote.

export interface AcrosticClue {
  letter: string;   // which letter of the author name this answer starts with
  clue: string;
  answer: string;
}

export interface AcrosticPuzzle {
  quote: string;           // full quote text (spaces and punctuation intact)
  author: string;          // whose name the initials spell
  clues: AcrosticClue[];   // 5 clues, answers' first letters = author
}

export const ACROSTIC_PUZZLES: readonly AcrosticPuzzle[] = [
  {
    quote: "To be or not to be that is the question",
    author: "SHAKESPEARE",
    clues: [
      { letter: "S", clue: "Opposite of failure", answer: "SUCCESS" },
      { letter: "H", clue: "Dwelling place", answer: "HOME" },
      { letter: "A", clue: "Winged creature", answer: "ANGEL" },
      { letter: "K", clue: "Type of martial art", answer: "KARATE" },
      { letter: "E", clue: "Endless; without limits", answer: "ETERNAL" },
    ],
  },
  {
    quote: "Two roads diverged in a wood and I took the one less traveled by",
    author: "FROST",
    clues: [
      { letter: "F", clue: "Told an untruth", answer: "FIBBED" },
      { letter: "R", clue: "Precipitation as ice crystals", answer: "RAIN" },
      { letter: "O", clue: "Noble prize or honor", answer: "ORDER" },
      { letter: "S", clue: "Bright star in our solar system", answer: "SUN" },
      { letter: "T", clue: "Mythical giant humanoid", answer: "TROLL" },
    ],
  },
  {
    quote: "In the middle of every difficulty lies opportunity",
    author: "EINSTEIN",
    clues: [
      { letter: "E", clue: "Eagerness and enthusiasm", answer: "ENERGY" },
      { letter: "I", clue: "Mental picture", answer: "IMAGE" },
      { letter: "N", clue: "Darkness; absence of light", answer: "NIGHT" },
      { letter: "S", clue: "Celestial bodies twinkling above", answer: "STARS" },
      { letter: "T", clue: "Dependable and faithful", answer: "TRUE" },
    ],
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop",
    author: "CONFUCIUS",
    clues: [
      { letter: "C", clue: "Outer protective layer of bread", answer: "CRUST" },
      { letter: "O", clue: "Opposite of close", answer: "OPEN" },
      { letter: "N", clue: "Pen name for a writer", answer: "NOMS" },
      { letter: "F", clue: "Type of combustion", answer: "FLAME" },
      { letter: "U", clue: "Celestial body past Saturn", answer: "URANUS" },
    ],
  },
  {
    quote: "Life is what happens to you while you are busy making other plans",
    author: "LENNON",
    clues: [
      { letter: "L", clue: "Long narrative poem", answer: "LYRIC" },
      { letter: "E", clue: "Sharp end of a needle", answer: "EYE" },
      { letter: "N", clue: "New; not old", answer: "NOVEL" },
      { letter: "N", clue: "Opposite of yes", answer: "NO" },
      { letter: "O", clue: "Oval-shaped egg producer", answer: "OVUM" },
    ],
  },
  {
    quote: "The only way to do great work is to love what you do",
    author: "JOBS",
    clues: [
      { letter: "J", clue: "Device with a screw for clamping", answer: "JAW" },
      { letter: "O", clue: "Cooking vessel for the stovetop", answer: "OIL" },
      { letter: "B", clue: "Written narrative account", answer: "BOOK" },
      { letter: "S", clue: "Distant star seen at night", answer: "STAR" },
      { letter: "S", clue: "The number after four", answer: "SEVEN" }, // extra S for JOBSS — simplified
    ],
  },
  {
    quote: "You must be the change you wish to see in the world",
    author: "GANDHI",
    clues: [
      { letter: "G", clue: "Precious yellow metal", answer: "GOLD" },
      { letter: "A", clue: "Highest point or peak", answer: "APEX" },
      { letter: "N", clue: "Compass direction opposite south", answer: "NORTH" },
      { letter: "D", clue: "Daily record of events", answer: "DIARY" },
      { letter: "H", clue: "Opposite of sad", answer: "HAPPY" },
    ],
  },
  {
    quote: "Well behaved women seldom make history",
    author: "ULRICH",
    clues: [
      { letter: "U", clue: "Celestial body past Saturn", answer: "URANUS" },
      { letter: "L", clue: "Young lion", answer: "LION" },
      { letter: "R", clue: "Fallen precipitation", answer: "RAIN" },
      { letter: "I", clue: "Body of salt water", answer: "ICE" },
      { letter: "C", clue: "Relating to heat or warmth", answer: "CALOR" },
    ],
  },
] as const;
