
import React from 'react';
import type { DictionaryEntry, ArabicEnglishPair, VerbForm } from '../types';
import { ResultCard } from './ResultCard';

interface ResultsDisplayProps {
  data: DictionaryEntry;
}

const PairedListItem: React.FC<{ item: ArabicEnglishPair }> = ({ item }) => (
  <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-slate-200 last:border-b-0">
    <p className="font-amiri text-xl text-slate-800" lang="ar" dir="rtl">{item.arabic}</p>
    <p className="text-slate-600 text-right sm:text-left">{item.english}</p>
  </li>
);

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center p-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <h2 className="font-amiri text-5xl font-bold text-blue-700" lang="ar" dir="rtl">{data.word}</h2>
        <p className="mt-2 text-2xl text-slate-700">{data.meaning.english}</p>
      </div>

      {data.exampleSentences.length > 0 && (
        <ResultCard title="Example Sentences" arabicTitle="جمل سبيل المثال">
            <ul className="space-y-4">
            {data.exampleSentences.map((sentence, index) => (
                <li key={index} className="p-3 bg-slate-50 rounded-md">
                    <p className="font-amiri text-xl text-slate-800 mb-1" lang="ar" dir="rtl">{sentence.arabic}</p>
                    <p className="text-slate-600 italic">"{sentence.english}"</p>
                </li>
            ))}
            </ul>
        </ResultCard>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {data.synonyms.length > 0 && (
          <ResultCard title="Synonyms" arabicTitle="مرادفات">
            <ul>
              {data.synonyms.map((synonym, index) => (
                <PairedListItem key={index} item={synonym} />
              ))}
            </ul>
          </ResultCard>
        )}

        {data.antonyms.length > 0 && (
          <ResultCard title="Antonyms" arabicTitle="متضادات">
            <ul>
              {data.antonyms.map((antonym, index) => (
                <PairedListItem key={index} item={antonym} />
              ))}
            </ul>
          </ResultCard>
        )}
      </div>

      {data.verbForms.length > 0 && (
        <ResultCard title="Verb Forms" arabicTitle="صيغ الفعل">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-300">
                  <th className="p-2 font-semibold text-slate-700">Form</th>
                  <th className="p-2 font-semibold text-slate-700 text-right">Arabic (صيغة)</th>
                  <th className="p-2 font-semibold text-slate-700">English</th>
                </tr>
              </thead>
              <tbody>
                {data.verbForms.map((form, index) => (
                  <tr key={index} className="border-b border-slate-200 last:border-b-0">
                    <td className="p-2 font-medium">{form.formName}</td>
                    <td className="p-2 font-amiri text-lg text-right" lang="ar" dir="rtl">{form.arabic}</td>
                    <td className="p-2 text-slate-600">{form.english}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ResultCard>
      )}
    </div>
  );
};

// Add fade-in animation to tailwind config if possible, or here as a style tag
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);

