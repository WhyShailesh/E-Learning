import { Link } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { Search, Sparkles, BookOpen, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Courses = () => {
  const [search, setSearch] = useState("");
  const { courses, loadingCourses, isCourseOwned } = useCourses();
  
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 py-12 px-4 md:px-8 font-sans selection:bg-indigo-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="relative mb-12 bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl shadow-indigo-900/5 rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="absolute top-0 right-0 -mx-32 -my-32 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl opacity-50 flex-none pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mx-32 -my-32 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl opacity-50 flex-none pointer-events-none" />
          
          <div className="relative z-10 w-full md:w-1/2">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
              <Sparkles className="w-4 h-4" /> Comprehensive Catalog
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 leading-tight">
              All Courses
            </h1>
            <p className="mt-4 text-base md:text-lg text-gray-500 max-w-lg leading-relaxed font-medium">
              Explore our catalogue and find the perfect premium course tailored for your journey to mastery.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            <div className="relative w-full md:w-96 shadow-xl shadow-indigo-900/5 rounded-2xl">
              <Input
                placeholder="Search specific courses or categories..."
                className="h-16 pl-14 pr-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white text-gray-900 placeholder:text-gray-400 focus-visible:border-indigo-500 focus-visible:ring-4 focus-visible:ring-indigo-500/20 transition-all font-medium text-base w-full shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400 w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loadingCourses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-white/60 bg-white/50 backdrop-blur-sm p-6 shadow-xl shadow-indigo-900/5 h-[420px] flex flex-col">
                <div className="h-48 rounded-2xl bg-indigo-50 mb-6 w-full" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-lg" />
                  <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-3" />
                <div className="h-4 w-full bg-gray-100 rounded-md mb-2" />
                <div className="h-4 w-2/3 bg-gray-100 rounded-md mb-auto" />
                <div className="h-12 w-full bg-gray-50 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-indigo-200 bg-white/60 backdrop-blur-md py-32 px-4 text-center shadow-inner">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-sm border border-white">
              <Search className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">No courses found</h3>
            <p className="mt-3 text-base text-gray-500 max-w-md">
              We couldn't find any courses matching "<span className="font-semibold text-indigo-600">{search}</span>". Try adjusting your search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((c, i) => (
              <Link
                key={c.id}
                to={`/learner/courses/${c.id}`}
                className="group flex flex-col bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-indigo-900/5 rounded-3xl p-6 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Course Image */}
                <div className="relative h-52 rounded-2xl mb-6 overflow-hidden bg-gray-50 shadow-inner flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {c.image_url || c.thumbnail ? (
                    <img
                      src={c.image_url || c.thumbnail}
                      alt={c.title}
                      className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-indigo-300/50">
                      <BookOpen className="h-14 w-14 mb-2 stroke-1" />
                      <span className="text-xs font-bold uppercase tracking-widest">No Cover Art</span>
                    </div>
                  )}
                  {isCourseOwned(c.id) && (
                    <span className="absolute right-4 top-4 z-20 rounded-full bg-emerald-500 border-2 border-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-lg drop-shadow-md">
                      Purchased
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-indigo-700">
                      {c.category || "Uncategorized"}
                    </span>
                    <span className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">
                      {c.level || "All Levels"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold leading-tight text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {c.title}
                  </h3>
                  
                  <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed font-medium">
                    {c.description}
                  </p>
                  
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-100/60">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Price</span>
                      <span className="text-xl font-black text-gray-900">
                        {c.price > 0 ? `₹${c.price}` : "Free"}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold">{c.rating || "New"}</span>
                      </div>
                      <span className="text-xs text-gray-400 mr-1">
                        {(c.students ?? 0).toLocaleString()} users
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
