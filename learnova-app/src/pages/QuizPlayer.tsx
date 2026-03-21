import { useState } from "react";

const QuizPlayer = ({ course }: any) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const quiz = course.quiz;
  const q = quiz[current];

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      alert("Quiz Completed 🎉");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* LEFT SIDEBAR */}
      <div className="w-72 border-r border-gray-700 p-4">
        <h2 className="font-semibold">{course.title}</h2>
        <p className="text-xs text-orange-400">Quiz Mode</p>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-10">

        {/* Question */}
        <p className="text-sm text-gray-400">
          Question {current + 1} of {quiz.length}
        </p>

        <h2 className="text-lg mt-2">{q.question}</h2>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {q.options.map((opt: string, i: number) => (
            <div
              key={i}
              onClick={() => setSelected(opt)}
              className={`border px-4 py-2 rounded cursor-pointer ${
                selected === opt
                  ? "border-blue-500"
                  : "border-gray-600"
              }`}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* Proceed */}
        <div className="mt-6">
          <button
            onClick={handleNext}
            className="bg-purple-600 px-4 py-2 rounded"
          >
            Proceed
          </button>
        </div>

        {/* Next */}
        <div className="absolute bottom-6 right-6">
          <button className="bg-purple-600 px-4 py-2 rounded">
            Next Content →
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPlayer;