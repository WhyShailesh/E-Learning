import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { api } from "@/services/api";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Lock, Play, Menu, FileText, HelpCircle, Video, X, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";// Types
interface Lesson {
  id: string;
  title: string;
  description?: string;
  type?: "video" | "document" | "quiz" | "lesson";
  content_url?: string;
  itemType?: "lesson" | "quiz";
}

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ PLAYER COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const QuizPlayer = ({ quizId, onFinish, isLast }: { quizId: string, onFinish: () => void, isLast: boolean }) => {
  const { token } = useAuth();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!quizId || !token) return;
    Promise.all([
      api.getQuiz(quizId),
      api.getQuizAttempt(token, quizId).catch(() => null)
    ]).then(([quizRes, attemptRes]) => {
      setQuiz(quizRes.data || quizRes);
      if (attemptRes) {
        setScore(attemptRes.score);
        setSubmitted(true);
      }
    }).catch(console.error);
  }, [quizId, token]);

  if (!quiz) {
    return <div className="absolute inset-0 text-gray-500 flex items-center justify-center p-8 bg-gray-50">Loading quiz data...</div>;
  }

  // Quiz without questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-3xl shadow-sm border border-gray-100">
          <HelpCircle className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Quiz Empty</h3>
          <p className="text-gray-500 mb-6">The instructor hasn't added any questions to this quiz yet.</p>
          <button onClick={onFinish} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-medium hover:bg-gray-300">Skip to next</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!token) return;
    try {
      const payload = {
        quiz_id: quiz.id,
        answers: Object.values(answers).map(optId => ({ option_id: optId }))
      };
      const res = await api.submitQuiz(token, payload);
      const computedScore = res.data?.score ?? res.score ?? 0;
      setScore(computedScore);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit quiz");
    }
  };

  const handleNext = () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmit();
    }
  };

  const handleRetake = () => {
    setSubmitted(false);
    setAnswers({});
    setCurrentIdx(0);
    setScore(0);
  };

  if (submitted) {
    return (
      <div className="absolute inset-0 w-full h-full p-4 md:p-8 flex items-center justify-center bg-gray-50/50">
        <div className="w-full max-w-3xl max-h-full flex flex-col bg-white shadow-xl shadow-indigo-900/5 border border-gray-100 rounded-3xl overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:px-8 border-b border-gray-100 shrink-0 bg-white">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">Quiz Completed!</h3>
                <p className="text-sm text-gray-500">You scored <span className="font-bold text-indigo-600">{score}</span> out of {quiz.questions.length}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleRetake} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                Retake Quiz
              </button>
              <button 
                onClick={onFinish} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 text-sm"
              >
                {isLast ? 'Finish Course' : 'Continue Course'}
              </button>
            </div>
          </div>

          {/* Scrollable Answer Review */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 bg-gray-50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Answer Review</h4>
            <div className="space-y-8">
              {quiz.questions.map((q: any, idx: number) => {
                const selectedOptId = answers[q.id];
                return (
                  <div key={q.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gray-200/60 shadow-sm">
                    <p className="font-bold text-gray-900 leading-relaxed mb-4">
                      <span className="text-gray-400 mr-2">{idx + 1}.</span>
                      {q.question_text || q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt: any) => {
                        const isSelected = selectedOptId === String(opt.id);
                        const isCorrect = opt.is_correct;
                        
                        let optClass = "border-gray-100 text-gray-600 bg-gray-50/50";
                        let icon = null;
                        
                        if (isCorrect) {
                          optClass = "border-emerald-200 bg-emerald-50 text-emerald-900 font-medium";
                          icon = <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
                        } else if (isSelected && !isCorrect) {
                          optClass = "border-red-200 bg-red-50 text-red-900 font-medium";
                          icon = <X className="w-5 h-5 text-red-500 shrink-0" />;
                        }

                        return (
                          <div key={opt.id} className={cn("p-3.5 rounded-xl border flex items-start gap-3", optClass)}>
                            {icon || <div className="w-5 h-5 border-2 border-gray-300 rounded-full shrink-0" />}
                            <span className="text-sm">{opt.option_text || opt.text}</span>
                            {isSelected && <span className="ml-auto text-xs font-bold uppercase tracking-wider opacity-60">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentIdx];

  return (
    <div className="absolute inset-0 w-full h-full p-4 md:p-8 flex items-center justify-center bg-gray-50/50">
      <div className="w-full max-w-3xl max-h-full flex flex-col bg-white shadow-xl shadow-indigo-900/5 border border-gray-100 rounded-3xl overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex items-center justify-between text-sm text-gray-500 p-5 md:px-8 border-b border-gray-100 shrink-0 bg-white">
          <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-xs md:text-sm">Question {currentIdx + 1} / {quiz.questions.length}</span>
          <span className="font-bold text-indigo-500 tracking-tight text-xs md:text-sm truncate ml-4">{quiz.title}</span>
        </div>
        
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 leading-relaxed">{question.question_text || question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((opt: any) => {
              const isSelected = answers[question.id] === String(opt.id);
              return (
                <button 
                  key={opt.id}
                  onClick={() => setAnswers(prev => ({ ...prev, [question.id]: String(opt.id) }))}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                    isSelected 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                      : 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'}`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                    {opt.option_text || opt.text}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-5 md:px-8 border-t border-gray-100 bg-gray-50/50 shrink-0">
          <button 
            disabled={!answers[question.id]}
            onClick={handleNext}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
              answers[question.id] 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 hover:bg-indigo-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentIdx === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
          </button>
        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED COURSE PLAYER (Rendered for Enrolled Users)
// ─────────────────────────────────────────────────────────────────────────────
const UnifiedPlayer = ({ course, quizzes, progress, isCourseOwned, purchaseCourse, markLessonComplete }: any) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Combine lessons and quizzes into a unified progression list
  const items = [
    ...(course.lessons || []).map((l: any) => ({ ...l, itemType: 'lesson' })),
    ...(quizzes || []).map((q: any) => ({ ...q, type: 'quiz', itemType: 'quiz' }))
  ];
  
  const total = items.length;
  const completedCount = progress.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // Auto-start at the next uncompleted lesson
  const nextUncompleted = items.findIndex((l: any) => l.itemType === 'lesson' && !progress.includes(String(l.id)));
  const initialIdx = nextUncompleted === -1 ? (total > 0 ? 0 : 0) : nextUncompleted;
  
  // Also support ?lesson=x in URL to deep link
  const urlLesson = searchParams.get("lesson");
  const defaultIdx = urlLesson ? parseInt(urlLesson) : initialIdx;

  const [activeLessonIndex, setActiveLessonIndex] = useState(defaultIdx || 0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLesson = items[activeLessonIndex];
  const isLastLesson = activeLessonIndex === total - 1;

  const handleNext = async () => {
    if (!activeLesson) return;
    
    // Mark current complete (Only lessons get marked complete right now, quizzes have their own submit logic)
    if (activeLesson.itemType === 'lesson') {
      await markLessonComplete(String(course.id), String(activeLesson.id));
    }
    
    if (!isLastLesson) {
      setActiveLessonIndex(activeLessonIndex + 1);
    } else {
      navigate("/learner/courses");
    }
  };

  const renderContent = (lesson: any) => {
    if (lesson.itemType === "quiz") {
      return <QuizPlayer quizId={String(lesson.id)} onFinish={handleNext} isLast={isLastLesson} />;
    }

    const url = lesson.content_url || "";

    if (!url) {
      return (
        <div className="text-gray-500 flex flex-col items-center">
          <Play className="w-12 h-12 mb-3 opacity-20" />
          <p>Content is missing or unavailable.</p>
        </div>
      );
    }

    if (lesson.type === 'document' || url.endsWith('.pdf')) {
      return (
        <iframe src={url} className="w-full h-full bg-white" title={lesson.title} />
      );
    }

    // Smart Youtube Detection
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) {
      const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
      return (
        <iframe 
          src={embedUrl}
          className="w-full h-full bg-black" 
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    // Google Drive Detection
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const embedUrl = `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      return (
        <iframe 
          src={embedUrl}
          className="w-full h-full bg-black" 
          title={lesson.title}
          allow="autoplay"
          allowFullScreen
        />
      );
    }

    // Native Video Check
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video controls className="w-full h-full object-contain bg-black" src={url}>
          Your browser does not support the video tag.
        </video>
      );
    }

    // Fallback Iframe
    return (
      <iframe 
        src={url}
        className="w-full h-full" 
        title={lesson.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  };

  if (!activeLesson) {
    return <div className="h-screen flex items-center justify-center text-gray-500 bg-gray-50">No lessons in this course yet!</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
      
      {/* ── LEFT SIDEBAR ── */}
      <div 
        className={`${sidebarOpen ? 'w-[320px]' : 'w-0'} flex-shrink-0 border-r border-gray-200 flex flex-col transition-all duration-300 relative bg-white z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
      >
        <div className="flex-1 w-[320px] flex flex-col max-h-screen">
          {/* Header */}
          <div className="p-5 pb-2">
            <button
              onClick={() => navigate("/learner/dashboard")}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm w-fit font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg leading-tight tracking-tight text-gray-900 mb-3">{course.title}</h2>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-500 rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">{percent}% Completed</p>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {items.map((lesson: any, idx: number) => {
              const isActive = idx === activeLessonIndex;
              const isComp = lesson.itemType === 'lesson' ? progress.includes(String(lesson.id)) : false; // Quiz completion relies on backend state not currently mapped to progress array
              
              const getIcon = () => {
                if (lesson.itemType === 'quiz') return <HelpCircle className="w-3.5 h-3.5 mb-0.5" />;
                if (lesson.type === 'video') return <Video className="w-3.5 h-3.5 mb-0.5" />;
                if (lesson.type === 'document') return <FileText className="w-3.5 h-3.5 mb-0.5" />;
                return <Circle className="w-3.5 h-3.5 mb-0.5" />;
              };

              return (
                <div
                  key={`${lesson.itemType}-${lesson.id}`}
                  onClick={() => setActiveLessonIndex(idx)}
                  className={`relative p-3 rounded-xl cursor-pointer transition-all duration-200 group flex gap-3 ${
                    isActive 
                      ? "bg-indigo-50 border border-indigo-100 shadow-sm" 
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  {/* Status Circle */}
                  <div className="pt-1 flex-shrink-0 transition-transform group-hover:scale-110">
                    {lesson.itemType === 'lesson' ? (
                      isComp ? (
                        <CheckCircle className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-emerald-500'}`} />
                      ) : (
                        <Circle className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-300'}`} />
                      )
                    ) : (
                      <HelpCircle className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-amber-500'}`} />
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-semibold leading-tight mb-1 ${isActive ? "text-indigo-900" : "text-gray-700"}`}>
                      {lesson.title}
                    </p>
                    
                    <div className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider ${isActive ? "text-indigo-500" : "text-gray-500"}`}>
                      {getIcon()}
                      <span>{lesson.itemType === 'quiz' ? 'Quiz' : (lesson.type || "Content")}</span>
                    </div>


                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-gray-50/50">
        
        {/* Hamburger Toggle */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-6 -translate-x-1/2 bg-white border border-gray-200 shadow-sm p-1.5 rounded-full z-20 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl w-full mx-auto">
          


          {/* Main Content Player Frame */}
          <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl ring-1 ring-black/5">
            {/* Player Header */}
            <div className="px-6 py-4 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-900 font-semibold tracking-tight text-lg flex items-center gap-2">
                {activeLesson.itemType === 'quiz' && <HelpCircle className="w-5 h-5 text-indigo-500" />}
                {activeLesson.itemType === 'lesson' && activeLesson.type === 'video' && <Video className="w-5 h-5 text-indigo-500" />}
                {activeLesson.itemType === 'lesson' && activeLesson.type === 'document' && <FileText className="w-5 h-5 text-indigo-500" />}
                {activeLesson.title}
              </h3>
            </div>

            {/* Player Body */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900/5">
              {renderContent(activeLesson)}
            </div>
          </div>

          {/* Bottom Footer bar */}
          {activeLesson.itemType !== 'quiz' && (
            <div className="pt-6 flex justify-end">
              <button
                onClick={handleNext}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-transform ${
                  isLastLesson 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'
                }`}
              >
                {isLastLesson ? 'Finish Course' : 'Next Lesson'}
                {!isLastLesson && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MODAL (MOCK SECURE CHECKOUT)
// ─────────────────────────────────────────────────────────────────────────────
const PaymentModal = ({ course, onPay, onClose }: { course: any; onPay: () => void; onClose: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPay();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 relative animate-fade-up border border-indigo-100/50">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-inner">
          <CreditCard className="w-8 h-8 text-indigo-600" />
        </div>
        
        <h3 className="text-2xl font-extrabold text-center text-gray-900 mb-2 tracking-tight">Secure Checkout</h3>
        <p className="text-center text-gray-500 mb-8 text-sm max-w-xs mx-auto leading-relaxed">
          You are about to purchase full lifetime access to <span className="font-bold text-gray-800">{course.title}</span>.
        </p>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 flex justify-between items-center shadow-inner">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Amount</span>
          <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            ₹{course.price || 0}
          </span>
        </div>

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            `Pay ₹${course.price || 0} Now`
          )}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COURSE DETAIL (Landing Page for Unenrolled Users)
// ─────────────────────────────────────────────────────────────────────────────
const CourseOverviewLanding = ({ course, purchaseCourse }: any) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-gray-500 hover:text-black">
        ← Back
      </button>

      {/* TOP SECTION */}
      <div className="border rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="flex gap-6 col-span-2">
            <div className="w-40 h-28 bg-gray-200 rounded-lg flex items-center justify-center text-xs overflow-hidden shrink-0 shadow-inner">
              {course.image_url ? (
                <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                "No Image"
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded w-fit font-medium">
                Course
              </span>
              <h2 className="text-2xl font-bold mt-2 text-gray-900">{course.title}</h2>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">{course.level || 'Beginner'}</span>
                <span>⭐ {course.rating || 5}</span>
                <span>👤 {course.students || 0} enrolled</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-l pl-8">
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {course.access_rule === 'open' 
                ? 'Free' 
                : course.access_rule === 'on-invitation' 
                  ? 'Private' 
                  : `₹${course.price || 0}`}
            </p>
            {course.access_rule === 'on-invitation' ? (
              <button
                disabled
                className="bg-gray-200 text-gray-400 px-8 py-3 rounded-lg font-medium w-full cursor-not-allowed"
              >
                Invitation Only
              </button>
            ) : (
              <button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-xl font-bold w-full shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                onClick={() => {
                  if (course.access_rule === 'on-payment' || course.price > 0) {
                    setShowPayment(true);
                  } else {
                    purchaseCourse(String(course.id));
                  }
                }}
              >
                {course.access_rule === 'on-payment' || course.price > 0 ? 'Buy Now' : 'Enroll Now'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal 
          course={course}
          onClose={() => setShowPayment(false)}
          onPay={() => {
            setShowPayment(false);
            purchaseCourse(String(course.id));
          }}
        />
      )}

      {/* TABS */}
      <div className="flex items-center gap-4 mt-8 border-b pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === "overview" ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Course Overview
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === "reviews" ? "border-b-2 border-purple-600 text-purple-700" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          Ratings and Reviews
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="mt-6 border rounded-xl bg-white p-6 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-gray-800">
            Course Curriculum ({course.lessons.length} lessons)
          </p>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            {course.lessons.map((lesson: any, idx: number) => (
              <div
                key={lesson.id || idx}
                className="flex items-center justify-between border-b last:border-b-0 py-3 px-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{lesson.type || 'content'}</p>
                  </div>
                </div>
                <Lock size={16} className="text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === "reviews" && (
        <div className="mt-6 border rounded-xl bg-white p-6 shadow-sm text-center py-20">
          <p className="text-gray-500">Reviews are only available to enrolled students.</p>
        </div>
      )}
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { purchasedCourses, getProgress, purchaseCourse, markLessonComplete } = useCourses();
  const [course, setCourse] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      api.getCourseById(id).then(setCourse).catch(console.error);
      api.getCourseQuizzes(id).then(setQuizzes).catch(console.error);
    }
  }, [id]);

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading course details...</p>
        </div>
      </div>
    );
  }

  // Enforce visibility constraint
  if (course.visibility === 'signed-in' && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-indigo-900/5 max-w-lg w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Members Only</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            This course requires a Learnova account. Please sign in or create an account to view the curriculum and enroll.
          </p>
          <a
            href="/login"
            className="inline-block w-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            Sign In to Access
          </a>
        </div>
      </div>
    );
  }

  // Admins and the course's own Instructor automatically get access to the player
  const isAdminOrInstructor = user?.role === "admin" || String(course.instructor_id) === String(user?.id);
  const isEnrolled = purchasedCourses.includes(String(course.id));
  const owned = isEnrolled || isAdminOrInstructor;

  const progress = getProgress(course.id);

  console.log(`[CourseDetail] id=${course.id}, isEnrolled=${isEnrolled}, isAdmin=${isAdminOrInstructor}`);

  if (owned) {
    return (
      <UnifiedPlayer 
        course={course} 
        quizzes={quizzes}
        progress={progress} 
        isCourseOwned={(cid: string) => purchasedCourses.includes(String(cid))}
        purchaseCourse={purchaseCourse}
        markLessonComplete={markLessonComplete}
      />
    );
  } else {
    return (
      <CourseOverviewLanding 
        course={course} 
        purchaseCourse={purchaseCourse} 
      />
    );
  }
};

export default CourseDetail;