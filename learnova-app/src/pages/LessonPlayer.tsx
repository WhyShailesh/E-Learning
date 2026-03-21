import { useParams, useNavigate } from "react-router-dom";
import { useCourses } from "@/contexts/CourseContext";

const LessonPlayer = () => {
  const { id, lessonIndex } = useParams();
  const navigate = useNavigate();
  const { courses, isCourseOwned, getProgress, markLessonComplete } = useCourses();

  const course = courses.find((c) => String(c.id) === String(id));
  const idx = parseInt(lessonIndex || "0");

  if (!course || !isCourseOwned(course.id)) {
    return <div className="p-10 text-center">Access Denied</div>;
  }

  const lesson = course.lessons[idx];
  const progress = getProgress(course.id);

  // ❌ Prevent crash if lesson doesn't exist
  if (!lesson) return <div className="p-10">Lesson not found</div>;

  // ✅ QUIZ HANDLING (IMPORTANT)
  if (lesson.type === "quiz") {
    return <div className="p-10 text-center">Quiz player is now API-backed and will be available in next iteration.</div>;
  }

  const percent = Math.round(
    (progress.length / course.lessons.length) * 100
  );

  const isLastLesson = idx === course.lessons.length - 1;

  const handleNext = () => {
    // mark current as complete
    markLessonComplete(String(course.id), String(lesson.id));

    if (!isLastLesson) {
      navigate(`/learner/courses/${course.id}/lesson/${idx + 1}`);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">

      {/* LEFT SIDEBAR */}
      <div className="w-72 border-r border-gray-700 p-4">

        {/* Back */}
        <button
          onClick={() => navigate(`/learner/courses/${course.id}`)}
          className="text-purple-400 text-sm mb-3"
        >
          ← Back
        </button>

        {/* Course Title */}
        <h2 className="font-semibold">{course.title}</h2>
        <p className="text-xs text-orange-400">{percent}% Completed</p>

        {/* Lessons */}
        <div className="mt-4 space-y-3">
          {course.lessons.map((l, i) => {
            const completed = progress.includes(String(l.id));

            return (
              <div
                key={i}
                onClick={() =>
                  navigate(`/learner/courses/${course.id}/lesson/${i}`)
                }
                className={`cursor-pointer text-sm ${
                  i === idx
                    ? "text-blue-400"
                    : completed
                    ? "text-green-400"
                    : "text-gray-300"
                }`}
              >
                {l.title}

                {/* Type Label */}
                <div className="text-xs text-green-400 ml-2">
                  {l.type === "video" && "Video"}
                  {l.type === "document" && "Document"}
                  {l.type === "quiz" && "Quiz"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-6 flex flex-col">

        {/* Description */}
        <div className="border border-gray-600 rounded p-3 text-sm text-gray-300 mb-4">
          {lesson.description || "Lesson description here..."}
        </div>

        {/* Viewer */}
        <div className="flex-1 border border-gray-600 rounded flex items-center justify-center">
          {lesson.content_url ? (
            <iframe
              src={lesson.content_url}
              className="w-full h-full"
              title="video"
            />
          ) : (
            <p>No content available</p>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="flex justify-end mt-4">
          {!isLastLesson ? (
            <button
              onClick={handleNext}
              className="bg-purple-600 px-4 py-2 rounded flex items-center gap-2"
            >
              Next Content →
            </button>
          ) : (
            <button
              onClick={() =>
                navigate(`/learner/courses/${course.id}/lesson/${idx + 1}`)
              }
              className="bg-green-600 px-4 py-2 rounded"
            >
              Go to Quiz →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;