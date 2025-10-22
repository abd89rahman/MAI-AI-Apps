import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { ChatbotIcon } from './icons/ChatbotIcon';
import { XIcon } from './icons/XIcon';
import { SendIcon } from './icons/SendIcon';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! How can I help you with your Arabic studies today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (isOpen && !chatSession) {
      const newChat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are a helpful and friendly AI assistant for students learning Arabic. You can answer questions about Arabic grammar, culture, vocabulary, or any other related topic. Keep your answers concise, accurate, and easy to understand.',
        },
      });
      setChatSession(newChat);
    }
  }, [isOpen, chatSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userInput = e.currentTarget.message.value.trim();
    if (!userInput || isLoading || !chatSession) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    e.currentTarget.reset();

    try {
      const result = await chatSession.sendMessage({ message: userInput });
      const modelResponse: Message = { role: 'model', text: result.text };
      setMessages(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      const errorMessage: Message = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className={`fixed bottom-20 right-4 sm:right-6 md:right-8 w-[calc(100%-2rem)] max-w-sm h-[70vh] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 ease-in-out z-40 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <h3 className="font-bold text-lg text-slate-800">Ask the Scholar</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-slate-500 hover:bg-slate-200" aria-label="Close chat">
            <XIcon />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-[80%] rounded-xl px-4 py-2 bg-slate-200 text-slate-800">
                  <div className="flex items-center space-x-1">
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-0"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-150"></span>
                      <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse delay-300"></span>
                  </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="relative">
            <input
              name="message"
              type="text"
              placeholder="Ask a question..."
              disabled={isLoading}
              className="w-full px-4 py-2 pr-12 text-sm bg-white border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-400"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        </form>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 md:right-8 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-50 transition-transform hover:scale-110"
        aria-label="Toggle chatbot"
      >
        <ChatbotIcon />
      </button>
    </>
  );
};