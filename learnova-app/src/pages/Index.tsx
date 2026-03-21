import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const { courses, loadingCourses } = useCourses();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">

      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {user?.name ? `Welcome back, ${user.name.split(" ")[0]}!` : "My Courses"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Browse and continue your learning journey</p>
        </div>

        <input
          type="text"
          placeholder="Search course"
          className="border px-3 py-2 rounded-md bg-white w-64"
        />
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-4 gap-6">

        {/* LEFT: Courses */}
        <div className="col-span-3">

          {/* Loading state */}
          {loadingCourses && (
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
                  <div className="h-32 rounded-md bg-gray-200 mb-3" />
                  <div className="h-4 rounded bg-gray-200 mb-2 w-3/4" />
                  <div className="h-3 rounded bg-gray-100 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingCourses && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50">
                <GraduationCap className="h-7 w-7 text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No courses available yet</p>
              <p className="mt-1.5 text-xs text-gray-400 max-w-xs">
                Check back soon — new courses will appear here once they are published.
              </p>
            </div>
          )}

          {/* Course grid */}
          {!loadingCourses && courses.length > 0 && (
            <div className="grid grid-cols-3 gap-6">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  to={`/learner/courses/${c.id}`}
                  className="block border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  {/* Course Image / Thumbnail */}
                  <div className="h-32 bg-gray-200 rounded-md mb-3 overflow-hidden flex items-center justify-center">
                    {c.image_url || c.thumbnail ? (
                      <img
                        src={c.image_url || c.thumbnail}
                        alt={c.title}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <BookOpen className="h-8 w-8 mb-1" />
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>

                  {/* Category / Level */}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {c.category && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {c.category}
                      </span>
                    )}
                    {c.level && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                        {c.level}
                      </span>
                    )}
                  </div>

                  {/* Instructor */}
                  {c.instructor_name && (
                    <p className="text-xs text-gray-400 mt-2">by {c.instructor_name}</p>
                  )}

                  {/* Button */}
                  <div className="mt-4">
                    {c.price > 0 ? (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Buy Course ₹{c.price}
                      </Button>
                    ) : (
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        Start Free
                      </Button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Profile Panel */}
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <h3 className="mb-4 font-semibold">My Profile</h3>

          {/* Points Circle */}
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-full border-4 border-green-500 flex items-center justify-center text-center bg-gray-50">
              <div>
                <p className="text-sm">Total 20 Points</p>
                <p className="text-orange-500 font-semibold">Newbie</p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-6 text-sm">
            <p className="mb-2 font-medium">Badges</p>
            <div className="space-y-1 text-gray-600">
              <p>Newbie - 20 Points</p>
              <p>Explorer - 40 Points</p>
              <p>Achiever - 60 Points</p>
              <p>Specialist - 80 Points</p>
              <p>Expert - 100 Points</p>
              <p>Master - 120 Points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;