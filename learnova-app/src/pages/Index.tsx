import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Search, Sparkles, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const Home = () => {
  const { user } = useAuth();
  const { courses, loadingCourses, isCourseOwned } = useCourses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 text-gray-900 p-4 md:p-8 font-sans selection:bg-indigo-200">

      {/* Hero Banner Area */}
      <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-900/5 rounded-3xl p-8 md:p-12 mb-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
        <div className="absolute top-0 right-0 -mx-20 -my-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mx-20 -my-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative z-10 w-full md:w-2/3">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
            <Sparkles className="w-4 h-4" /> Learnova Premium
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
            {user?.name ? (
              <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{user.name.split(" ")[0]}!</span></>
            ) : (
              <>Ignite Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Learning</span> Journey</>
            )}
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            Beautifully crafted courses designed to propel your skills to the absolute highest tier. Explore, enroll, and truly master your craft.
          </p>
        </div>

        <div className="relative z-10 w-full md:w-auto shrink-0 flex items-center justify-end">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search specific course..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700 placeholder:text-gray-400 outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* LEFT: Courses */}
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            Available Courses
          </h2>

          {/* Loading state */}
          {loadingCourses && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-3xl border border-gray-100 bg-white/60 p-5">
                  <div className="h-40 rounded-2xl bg-indigo-50 mb-4" />
                  <div className="h-5 rounded bg-gray-200 mb-3 w-3/4" />
                  <div className="h-3 rounded bg-gray-100 w-1/2 mb-6" />
                  <div className="h-10 rounded-xl bg-gray-50 mt-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingCourses && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/50 backdrop-blur-sm py-28 text-center shadow-inner">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm border border-white">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <p className="text-xl font-extrabold text-gray-900 tracking-tight">No courses available yet</p>
              <p className="mt-2 text-sm text-gray-500 max-w-sm">
                Check back very soon—incredible new premium courses will appear here once they are officially published by our instructors.
              </p>
            </div>
          )}

          {/* Course grid */}
          {!loadingCourses && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/learner/courses/${c.id}`}
                  className="group flex flex-col bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-indigo-900/5 rounded-3xl p-5 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Course Image */}
                  <div className="relative aspect-video overflow-hidden rounded-t-2xl">
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
                        <span className="text-xs font-medium uppercase tracking-widest">No Cover Art</span>
                      </div>
                    )}
                  </div>

                  {/* Title & Info */}
                  <div className="flex flex-col flex-1">
                    <h3 className="text-lg font-bold leading-snug text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{c.title}</h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{c.description}</p>
                    
                    {/* Instructor */}
                    {c.instructor_name && (
                      <p className="text-xs font-semibold text-gray-400 mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> by {c.instructor_name}
                      </p>
                    )}

                    <div className="mt-auto pt-5 space-y-4">
                      {/* Tags */}
                      <div className="flex gap-2 flex-wrap">
                        {c.category && (
                          <span className="text-[11px] font-bold uppercase tracking-widest bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg border border-purple-100">
                            {c.category}
                          </span>
                        )}
                        {c.level && (
                          <span className="text-[11px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg border border-blue-100">
                            {c.level}
                          </span>
                        )}
                      </div>

                      {/* Button */}
                      {isCourseOwned(c.id) ? (
                        <div className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border border-emerald-100 text-sm font-bold py-2.5 rounded-xl text-center transition-colors shadow-sm">
                          Continue Learning
                        </div>
                      ) : c.price > 0 ? (
                        <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20 text-sm font-bold py-2.5 rounded-xl text-center transition-all">
                          Enroll for ₹{c.price}
                        </div>
                      ) : (
                        <div className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-600/20 text-sm font-bold py-2.5 rounded-xl text-center transition-all">
                          Start For Free
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Profile Panel */}
        <div className="col-span-1">
          <div className="sticky top-6 bg-white/60 backdrop-blur-xl border border-white shadow-xl shadow-indigo-900/5 rounded-3xl p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-2xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
            
            <h3 className="text-lg font-extrabold tracking-tight text-gray-900 mb-6 flex items-center gap-2 relative z-10">
              <Award className="w-5 h-5 text-indigo-500" /> My Profile
            </h3>

            {/* Points Circle */}
            <div className="flex justify-center mb-8 relative z-10">
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-white to-indigo-50/50 flex items-center justify-center text-center shadow-lg shadow-indigo-900/5">
                <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-br from-indigo-400 to-purple-400 mask-circle" style={{ WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', padding: '3px' }} />
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-indigo-600 to-purple-600 mb-1">
                    20
                  </span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Points</p>
                  <p className="mt-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">Newbie</p>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 px-2">Achievement Tiers</p>
              <div className="space-y-2">
                {[
                  { name: "Newbie", pts: 20, active: true },
                  { name: "Explorer", pts: 40, active: false },
                  { name: "Achiever", pts: 60, active: false },
                  { name: "Specialist", pts: 80, active: false },
                  { name: "Expert", pts: 100, active: false },
                  { name: "Master", pts: 120, active: false },
                ].map((badge, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border text-sm transition-colors", badge.active ? "bg-indigo-50 border-indigo-100" : "bg-white/50 border-gray-100 opacity-60")}>
                    <span className={cn("font-bold", badge.active ? "text-indigo-900" : "text-gray-600")}>
                      {badge.name}
                    </span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md", badge.active ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500")}>
                      {badge.pts} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;