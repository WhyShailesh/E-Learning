import { GraduationCap } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-2xl w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">About Learnova</h1>
      </div>
    </div>
  );
}
