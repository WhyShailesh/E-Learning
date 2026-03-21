import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/contexts/CourseContext";
import { Button } from "@/components/ui/button";

const Home = () => {
  const { user } = useAuth();
  const { courses } = useCourses();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">

      {/* Header Row (NO duplicate navbar now) */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>

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
          <div className="grid grid-cols-3 gap-6">
            {courses.map((c) => (
              <Link
                key={c.id}
                to={`/learner/courses/${c.id}`}
                className="block border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition cursor-pointer"
              >
                {/* Course Image */}
                <div className="h-32 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-sm text-gray-500">
                  Course Cover
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold">{c.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{c.description}</p>

                {/* Tags */}
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    Tag 1
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    Tag 2
                  </span>
                </div>

                {/* Button */}
                <div className="mt-4">
                  {c.price > 0 ? (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Buy Course ₹{c.price}
                    </Button>
                  ) : (
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      Continue
                    </Button>
                  )}
                </div>
              </Link>
            ))}
          </div>
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