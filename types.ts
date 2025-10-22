
export interface ArabicEnglishPair {
  arabic: string;
  english: string;
}

export interface VerbForm extends ArabicEnglishPair {
  formName: string;
}

export interface DictionaryEntry {
  word: string;
  meaning: ArabicEnglishPair;
  synonyms: ArabicEnglishPair[];
  antonyms: ArabicEnglishPair[];
  verbForms: VerbForm[];
  exampleSentences: ArabicEnglishPair[];
}
