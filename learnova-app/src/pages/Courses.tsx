import { Link } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Courses = () => {
  const [search, setSearch] = useState("");
  const { courses, loadingCourses, isCourseOwned } = useCourses();
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">All Courses</h1>
          <p className="mt-2 text-muted-foreground">Explore our catalogue and find the perfect course for you</p>
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loadingCourses ? (
          <p className="text-center text-muted-foreground py-20">Loading courses...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No courses found matching "{search}"</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <Link
                key={c.id}
                to={`/learner/courses/${c.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-foreground/[0.04] animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  {isCourseOwned(c.id) && (
                    <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-0.5 text-xs font-medium text-success-foreground">Purchased</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{c.category}</span>
                    <span className="text-xs text-muted-foreground">{c.level}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground leading-snug">{c.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-lg font-bold text-foreground">₹{c.price}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>⭐ {c.rating}</span>
                      <span>{c.students.toLocaleString()} students</span>
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
