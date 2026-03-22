import { Link } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { BookOpen, Play, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MyCourses = () => {
  const { courses, purchasedCourses, getProgress } = useCourses();
  const owned = courses.filter((c) => purchasedCourses.includes(c.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 py-12 px-4 md:px-8 font-sans selection:bg-indigo-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="relative mb-12 flex flex-col items-center text-center p-8 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-900/5 rounded-3xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-300/20 to-rose-200/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-300/20 to-blue-200/20 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-100">
              <Sparkles className="w-4 h-4" /> Learner Dashboard
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-3">
              My Courses
            </h1>
            <p className="text-lg text-gray-500 font-medium">Continue your learning journey and track your premium progress.</p>
          </div>
        </div>

        {/* Content Section */}
        {owned.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-24 px-4 text-center shadow-inner">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm border border-white">
              <BookOpen className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">No courses enrolled yet</h3>
            <p className="mt-3 text-base text-gray-500 max-w-md">
              You haven't purchased or started any courses. Explore our premium catalogue to begin learning today.
            </p>
            <Link to="/learner/courses" className="mt-8 relative group cursor-pointer inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
              <button className="relative bg-white text-indigo-700 border border-indigo-100 hover:bg-indigo-50 font-extrabold px-8 py-4 rounded-xl shadow-sm transition-colors text-base">
                Browse Full Catalog
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {owned.map((c, i) => {
              const progress = getProgress(c.id) || [];
              const totalLessons = c.lessons?.length || 1;
              const pct = Math.min(100, Math.round((progress.length / totalLessons) * 100));
              const isCompleted = pct === 100;

              return (
                <div
                  key={c.id}
                  className="group flex flex-col bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-indigo-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 overflow-hidden animate-fade-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Course Image */}
                  <div className="relative h-48 rounded-2xl mb-6 overflow-hidden bg-gray-50 shadow-inner flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent z-10 opacity-60 transition-opacity duration-300" />
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.title}
                        className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-indigo-300/50">
                        <BookOpen className="h-12 w-12 mb-2 stroke-1" />
                        <span className="text-xs font-bold uppercase tracking-widest">No Cover Art</span>
                      </div>
                    )}

                    {/* Completion Badge */}
                    {isCompleted && (
                      <span className="absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-lg drop-shadow-md border-2 border-white">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-[19px] font-bold leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                      Inst: {c.instructor_name || "Unknown"}
                    </p>

                    {/* Progress Bar Area */}
                    <div className="mt-6 border-t border-gray-100/60 pt-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          {progress.length} / {totalLessons} Modules
                        </span>
                        <span className={cn("text-xs font-black", isCompleted ? "text-emerald-500" : "text-indigo-600")}>
                          {pct}%
                        </span>
                      </div>
                      
                      <div className="relative h-2.5 w-full rounded-full bg-gray-100 shadow-inner overflow-hidden">
                        <div 
                          className={cn(
                            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
                            isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-indigo-500 to-purple-500"
                          )} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-6">
                      <Link to={`/learner/courses/${c.id}?lesson=${progress.length < totalLessons ? Math.max(...progress.map(Number), -1) + 1 : 0}`}>
                        <Button className="group/btn h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-600/20 font-extrabold text-sm transition-all hover:-translate-y-0.5">
                          <Play className="mr-2 h-4 w-4 fill-white" />
                          {pct > 0 ? (isCompleted ? "Review Course" : "Continue Learning") : "Start Course"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
