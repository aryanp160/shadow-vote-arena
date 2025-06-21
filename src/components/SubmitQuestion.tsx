import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SubmitQuestionProps {
  onSubmit: (questionText: string) => void;
  onCancel: () => void;
}

export const SubmitQuestion: React.FC<SubmitQuestionProps> = ({
  onSubmit,
  onCancel
}) => {
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.trim()) {
      onSubmit(questionText.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-lg w-full">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-cyan-500/30 to-pink-500/30 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-cyan-400/50 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
              ⚔️ ENTER THE ARENA
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-cyan-400 text-sm font-bold mb-3">
                YOUR BATTLE DECISION
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Should I quit my job? Should I move to Mars? Should I dye my hair neon green?"
                className="w-full bg-black/60 border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none resize-none backdrop-blur-sm"
                rows={4}
                maxLength={200}
                required
              />
              <p className="text-gray-500 text-xs mt-2 flex justify-between">
                <span>Make it wild. Make it anonymous.</span>
                <span>{questionText.length}/200</span>
              </p>
            </div>

            {/* Warning */}
            <div className="bg-purple-900/30 border border-purple-400/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-300 text-xs font-bold flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                COMPLETELY ANONYMOUS • AUTO-DELETE AFTER 15 DAYS
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 py-3 px-4 rounded-xl font-bold transition-all duration-200"
              >
                RETREAT
              </button>
              <button
                type="submit"
                disabled={!questionText.trim()}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white py-3 px-4 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
              >
                BATTLE!
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
