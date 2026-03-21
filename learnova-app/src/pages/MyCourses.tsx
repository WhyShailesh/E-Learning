import { Link } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";
import { BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const MyCourses = () => {
  const { courses, purchasedCourses, getProgress } = useCourses();
  const owned = courses.filter((c) => purchasedCourses.includes(c.id));

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-10 animate-fade-up">
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="mt-2 text-muted-foreground">Continue where you left off</p>
        </div>

        {owned.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up">
            <BookOpen className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h2 className="text-xl font-semibold text-foreground">No courses yet</h2>
            <p className="mt-2 text-muted-foreground">Purchase a course to start learning</p>
            <Link to="/learner/courses" className="mt-6">
              <Button>Browse Courses</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map((c, i) => {
              const progress = getProgress(c.id);
              const pct = Math.round((progress.length / c.lessons.length) * 100);
              return (
                <div
                  key={c.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-sm animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="aspect-video overflow-hidden">
                   <img src={c.image_url || c.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"} alt={c.title} className="h-full w-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{c.instructor_name}</p>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground">{progress.length}/{c.lessons.length} lessons</span>
                        <span className="text-xs font-medium text-foreground">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-secondary">
                        <div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <Link to={`/learner/courses/${c.id}/lesson/${progress.length < c.lessons.length ? Math.max(...progress.map(Number), -1) + 1 : 0}`}>
                      <Button className="mt-4 w-full" size="sm">
                        <Play className="mr-1.5 h-4 w-4" />
                        {pct > 0 ? "Continue Learning" : "Start Learning"}
                      </Button>
                    </Link>
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
