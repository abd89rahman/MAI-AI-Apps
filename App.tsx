
import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchWordDetails } from './services/geminiService';
import type { DictionaryEntry } from './types';

const App: React.FC = () => {
  const [dictionaryData, setDictionaryData] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setError("Please enter an Arabic word.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDictionaryData(null);

    try {
      const result = await fetchWordDetails(query);
      setDictionaryData(result);
    } catch (err) {
      console.error(err);
      setError("Sorry, an error occurred while fetching the data. Please check the word and try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExampleSearch = (word: string) => {
    const searchInput = document.getElementById('arabic-search') as HTMLInputElement;
    if (searchInput) {
        searchInput.value = word;
    }
    handleSearch(word);
  };


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Arabic Scholar AI <span className="text-2xl md:text-3xl font-amiri" lang="ar" dir="rtl">باحث العربية</span>
            </h1>
            <p className="mt-2 text-lg text-slate-600">
                Your AI-powered guide to the Arabic language.
            </p>
        </header>

        <main>
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
            <div className="mt-4 text-center text-sm text-slate-500">
              Try an example: 
              <button onClick={() => handleExampleSearch('كتاب')} className="underline hover:text-blue-600 mx-1">كتاب</button>
              <button onClick={() => handleExampleSearch('شمس')} className="underline hover:text-blue-600 mx-1">شمس</button>
              <button onClick={() => handleExampleSearch('جميل')} className="underline hover:text-blue-600 mx-1">جميل</button>
            </div>
          </div>
          <div className="mt-8 max-w-4xl mx-auto">
            {isLoading && <LoadingSpinner />}
            {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
            {dictionaryData && <ResultsDisplay data={dictionaryData} />}
            {!isLoading && !error && !dictionaryData && (
              <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-semibold text-slate-700">Welcome!</h2>
                <p className="mt-2 text-slate-500">
                  Enter an Arabic word above to get its meaning, synonyms, antonyms, verb forms, and example sentences.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
