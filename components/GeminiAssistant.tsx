
import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';

export const GeminiAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query) return;
    setLoading(true);
    try {
      // Fix: Create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date configuration.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Fix: Use gemini-3-pro-preview for complex reasoning and technical blockchain engineering queries.
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as a senior Midnight Blockchain Engineer. Explain the following or answer the developer question clearly: ${query}`,
        config: {
          systemInstruction: "You are an expert on the Midnight network, ZK-proofs, and privacy-preserving smart contracts. Provide concise, technical, and accurate developer advice.",
        }
      });
      // Fix: Correctly extract the generated text output via the .text property.
      setResponse(res.text || 'No response generated.');
    } catch (err) {
      setResponse('Error: Failed to fetch response from Gemini. Check console.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-indigo-900/30 rounded-xl p-6 midnight-glow">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
          <i className="fas fa-brain text-white"></i>
        </div>
        <h3 className="text-lg font-semibold text-indigo-100">Midnight Dev Assistant</h3>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. How do shielded transactions work in Midnight?"
            className="w-full bg-[#050505] border border-gray-800 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none h-24"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-1.5 rounded-md text-sm font-medium transition-all"
          >
            {loading ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
            Analyze
          </button>
        </div>

        {response && (
          <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-lg p-4 animate-fadeIn">
            <p className="text-sm text-indigo-200 leading-relaxed whitespace-pre-wrap">
              {response}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
