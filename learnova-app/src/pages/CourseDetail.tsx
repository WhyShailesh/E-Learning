import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCourses } from "@/contexts/CourseContext";
import { ArrowLeft, CheckCircle, Lock, Play } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses, isCourseOwned, getProgress, purchaseCourse } = useCourses();

  const course = courses.find((c) => String(c.id) === String(id));
  if (!course) return <div>Course not found</div>;

  const owned = isCourseOwned(course.id);
  const progress = getProgress(course.id);

  const completed = progress.length;
  const total = course.lessons.length;
  const percent = owned ? Math.round((completed / total) * 100) : 0;

  // ⭐ Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // ⭐ Reviews State
  const [reviews, setReviews] = useState([
    { name: "John", rating: 4, text: "Great course!" },
  ]);

  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);

  const handleAddReview = () => {
    if (!newReview) return;

    setReviews([
      ...reviews,
      {
        name: "You",
        rating,
        text: newReview,
      },
    ]);

    setNewReview("");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-500 hover:text-black"
      >
        ← Back
      </button>

      {/* TOP SECTION */}
      <div className="border rounded-xl bg-white p-4">
        <div className="grid grid-cols-3 gap-6 items-center">

          {/* LEFT */}
          <div className="flex gap-4">
            <div className="w-28 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
              Image
            </div>

            <div>
              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                Course
              </span>
              <h2 className="font-semibold mt-1">{course.title}</h2>
              <p className="text-xs text-gray-500">
                {course.description}
              </p>
            </div>
          </div>

          {/* CENTER */}
          <div className="text-center font-medium">
            Cover Image
          </div>

          {/* RIGHT (PROGRESS) */}
          <div className="border rounded p-3">
            <p className="text-sm mb-1">{percent}% Completed</p>

            <div className="h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${percent}%` }}
              />
            </div>

            <div className="flex justify-between mt-3 text-sm">
              <div className="border px-2 py-1 rounded text-center">
                {total}
                <p className="text-xs">Content</p>
              </div>

              <div className="border px-2 py-1 rounded text-center">
                {completed}
                <p className="text-xs">Completed</p>
              </div>

              <div className="border px-2 py-1 rounded text-center">
                {total - completed}
                <p className="text-xs">Incomplete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 mt-6 border-b pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-3 py-1 rounded text-sm ${
            activeTab === "overview"
              ? "bg-purple-200"
              : "text-gray-500"
          }`}
        >
          Course Overview
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`px-3 py-1 rounded text-sm ${
            activeTab === "reviews"
              ? "bg-purple-200"
              : "text-gray-500"
          }`}
        >
          Ratings and Reviews
        </button>

        <div className="ml-auto">
          <input
            placeholder="Search content"
            className="border px-3 py-1 rounded text-sm"
          />
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="mt-4 border rounded-xl bg-white p-4">

          <p className="mb-3 text-sm font-medium">
            {total} Contents
          </p>

          {course.lessons.map((lesson, idx) => {
            const isCompleted = progress.includes(String(lesson.id));
            const canAccess = owned;

            return (
              <div
                key={idx}
                className="flex items-center justify-between border-b py-2 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  canAccess &&
                  navigate(`/learner/courses/${course.id}/lesson/${idx}`)
                }
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">#</span>
                  <p className="text-sm">{lesson.title}</p>
                </div>

                <div>
                  {!canAccess ? (
                    <Lock size={16} />
                  ) : isCompleted ? (
                    <CheckCircle size={16} className="text-blue-500" />
                  ) : (
                    <Play size={16} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!owned && (
        <div className="mt-6">
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded"
            onClick={() => purchaseCourse(String(course.id))}
          >
            Enroll Now
          </button>
        </div>
      )}

      {/* REVIEWS TAB */}
      {activeTab === "reviews" && (
        <div className="mt-4 border rounded-xl bg-white p-4">

          {/* Add Review */}
          <div className="mb-4">
            <textarea
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Write your review..."
              className="w-full border rounded p-2"
            />

            <div className="flex items-center gap-2 mt-2">
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="border px-2 py-1 rounded"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r}⭐
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddReview}
                className="bg-purple-600 text-white px-4 py-1 rounded"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map((r, i) => (
              <div key={i} className="border p-2 rounded">
                <p className="font-medium">{r.name}</p>
                <p className="text-sm">{r.rating}⭐</p>
                <p className="text-sm text-gray-600">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;