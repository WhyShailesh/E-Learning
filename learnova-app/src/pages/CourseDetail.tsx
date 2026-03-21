import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { api } from "@/services/api";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Lock, Play, Menu, FileText, HelpCircle, Video } from "lucide-react";

// Types
interface Lesson {
  id: string;
  title: string;
  description?: string;
  type?: "video" | "document" | "quiz";
  content_url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED COURSE PLAYER (Rendered for Enrolled Users)
// ─────────────────────────────────────────────────────────────────────────────
const UnifiedPlayer = ({ course, progress, isCourseOwned, purchaseCourse, markLessonComplete }: any) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const total = course.lessons.length;
  const completedCount = progress.length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  // Auto-start at the next uncompleted lesson
  const nextUncompleted = course.lessons.findIndex((l: any) => !progress.includes(String(l.id)));
  const initialIdx = nextUncompleted === -1 ? 0 : nextUncompleted;
  
  // Also support ?lesson=x in URL to deep link
  const urlLesson = searchParams.get("lesson");
  const defaultIdx = urlLesson ? parseInt(urlLesson) : initialIdx;

  const [activeLessonIndex, setActiveLessonIndex] = useState(defaultIdx || 0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLesson = course.lessons[activeLessonIndex];
  const isLastLesson = activeLessonIndex === total - 1;

  const handleNext = async () => {
    if (!activeLesson) return;
    
    // Mark current complete
    await markLessonComplete(String(course.id), String(activeLesson.id));
    
    if (!isLastLesson) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const renderContent = (lesson: any) => {
    if (lesson.type === "quiz") {
      return (
        <div className="text-center p-8">
          <HelpCircle className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-80" />
          <h4 className="text-2xl font-bold mb-2">Quiz Time</h4>
          <p className="text-gray-400 mb-6">Test your knowledge on this topic.</p>
          <button className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-medium transition-colors">
            Start Quiz
          </button>
        </div>
      );
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
    return <div className="h-screen flex items-center justify-center text-white bg-[#0f111a]">No lessons in this course yet!</div>;
  }

  return (
    <div className="flex h-screen bg-[#0f111a] text-white overflow-hidden font-sans">
      
      {/* ── LEFT SIDEBAR ── */}
      <div 
        className={`${sidebarOpen ? 'w-[320px]' : 'w-0'} flex-shrink-0 border-r border-[#2a2e3d] flex flex-col transition-all duration-300 relative bg-[#0f111a] z-10`}
      >
        <div className="flex-1 w-[320px] flex flex-col max-h-screen">
          {/* Header */}
          <div className="p-5 pb-2">
            <button
              onClick={() => navigate("/learner/dashboard")}
              className="flex items-center gap-2 px-3 py-1.5 border border-purple-500/50 rounded-lg text-purple-300 hover:bg-purple-900/30 transition-colors text-sm w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          <div className="px-5 py-4 border-b border-[#2a2e3d]">
            <h2 className="font-semibold text-lg leading-tight tracking-wide mb-3">{course.title}</h2>
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all rounded-full" style={{ width: `${percent}%` }} />
            </div>
            <p className="mt-2 text-sm text-orange-400">{percent}% Completed</p>
          </div>

          {/* Lesson List */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
            {course.lessons.map((lesson: Lesson, idx: number) => {
              const isActive = idx === activeLessonIndex;
              const isComp = progress.includes(String(lesson.id));
              
              const getIcon = () => {
                if (lesson.type === 'video') return <Video className="w-3.5 h-3.5 mb-0.5" />;
                if (lesson.type === 'document') return <FileText className="w-3.5 h-3.5 mb-0.5" />;
                if (lesson.type === 'quiz') return <HelpCircle className="w-3.5 h-3.5 mb-0.5" />;
                return null;
              };

              return (
                <div
                  key={lesson.id}
                  onClick={() => setActiveLessonIndex(idx)}
                  className={`relative p-3 rounded-lg cursor-pointer transition-colors group flex gap-3 ${
                    isActive ? "bg-blue-900/10" : "hover:bg-white/5"
                  }`}
                >
                  {/* Status Circle */}
                  <div className="pt-1 flex-shrink-0">
                    {isComp ? (
                      <CheckCircle className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-green-500'}`} />
                    ) : (
                      <Circle className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[15px] font-medium leading-tight mb-1.5 ${isActive ? "text-blue-400" : "text-gray-200"}`}>
                      {lesson.title}
                    </p>
                    
                    <div className={`flex items-center gap-1.5 text-xs ${isActive ? "text-green-400" : "text-gray-500"}`}>
                      {getIcon()}
                      <span className="capitalize">{lesson.type || "Content"}</span>
                    </div>

                    {lesson.description && (
                      <p className="mt-1.5 text-xs text-green-500/70 italic line-clamp-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-[#0c0e15]">
        
        {/* Hamburger Toggle (Absolute overlapping left edge) */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-0 top-6 -translate-x-1/2 bg-[#1a1d29] border border-[#2a2e3d] p-1.5 rounded-full z-20 text-gray-400 hover:text-white hover:bg-[#2a2e3d] transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl w-full mx-auto">
          
          {/* Top Description Box */}
          <div className="border border-[#2a2e3d] bg-black/40 rounded-xl p-5 mb-6">
            <p className="text-orange-300/80 text-sm leading-relaxed">
              {activeLesson.description || "No description provided for this content."}
            </p>
          </div>

          {/* Main Content Player Frame */}
          <div className="flex-1 flex flex-col border-2 border-[#2a2e3d] bg-black rounded-2xl overflow-hidden shadow-2xl">
            {/* Player Header */}
            <div className="px-6 py-4 bg-[#11131c] border-b border-[#2a2e3d]">
              <h3 className="text-blue-400 font-medium tracking-wide">
                {activeLesson.title}
              </h3>
            </div>

            {/* Player Body */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              {renderContent(activeLesson)}
            </div>
          </div>

          {/* Bottom Footer bar */}
          <div className="pt-6 flex justify-end">
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-2.5 rounded border transition-all ${
                isLastLesson 
                  ? 'border-green-500/50 bg-green-900/20 text-green-400 hover:bg-green-900/40' 
                  : 'border-purple-500/50 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              {isLastLesson ? 'Finish Course' : 'Next Content'}
              {!isLastLesson && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          
        </div>
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
              {course.image_url || course.thumbnail ? (
                <img src={course.image_url || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                "No Image"
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded w-fit font-medium">
                Course
              </span>
              <h2 className="text-2xl font-bold mt-2 text-gray-900">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-lg">
                {course.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">{course.level || 'Beginner'}</span>
                <span>⭐ {course.rating || 5}</span>
                <span>👤 {course.students || 0} enrolled</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-l pl-8">
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {course.price > 0 ? `₹${course.price}` : 'Free'}
            </p>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium w-full shadow-md transition-colors"
              onClick={() => purchaseCourse(String(course.id))}
            >
              Enroll Now
            </button>
          </div>
        </div>
      </div>

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

  useEffect(() => {
    if (id) {
      api.getCourseById(id).then(setCourse).catch(console.error);
    }
  }, [id]);

  if (!course) {
    return <div className="h-screen flex items-center justify-center bg-[#0f111a] text-gray-500">Loading course details...</div>;
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