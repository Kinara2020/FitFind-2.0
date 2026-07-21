import React, { useState } from 'react';

const questions = [
  { q: "What's your preferred style?", options: ["Casual", "Formal", "Streetwear", "Ethnic"] },
  { q: "Favourite colour palette?", options: ["Neutrals", "Brights", "Pastels", "Dark tones"] },
  { q: "How do you dress for occasions?", options: ["Comfort first", "Style first", "Mix both", "Depends on mood"] },
  { q: "Preferred fit?", options: ["Slim", "Regular", "Oversized", "Athletic"] },
  { q: "Go-to category?", options: ["Topwear", "Bottomwear", "Footwear", "Accessories"] },
];

export default function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);

  const handleAnswer = (ans) => {
    const next = [...answers, ans];
    setAnswers(next);
    if (step + 1 >= questions.length) {
      setDone(true);
      localStorage.setItem('styleProfile', JSON.stringify(next));
    } else {
      setStep(step + 1);
    }
  };

  if (done) return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <p className="text-5xl mb-4">✅</p>
      <h2 className="text-2xl font-bold text-white mb-2">Style Profile Built!</h2>
      <p className="text-gray-400 mb-6">Your preferences are saved. Search results will now be personalised.</p>
      <div className="bg-[#1a1a2e] rounded-xl p-4 text-left">
        {questions.map((q, i) => (
          <div key={i} className="mb-2">
            <p className="text-gray-400 text-xs">{q.q}</p>
            <p className="text-purple-400 text-sm font-medium">{answers[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const current = questions[step];
  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <div className="mb-6">
        <div className="flex gap-1 mb-4">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded ${i <= step ? 'bg-purple-500' : 'bg-gray-700'}`} />
          ))}
        </div>
        <p className="text-gray-400 text-sm">Question {step + 1} of {questions.length}</p>
        <h2 className="text-2xl font-bold text-white mt-2">{current.q}</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {current.options.map((opt) => (
          <button key={opt} onClick={() => handleAnswer(opt)}
            className="bg-[#1a1a2e] hover:bg-purple-800 border border-purple-800 hover:border-purple-400 rounded-xl p-4 text-white text-sm font-medium transition">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}