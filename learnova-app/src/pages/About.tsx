import { CheckCircle2, Users } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Minimal Header */}
        <div className="mb-12 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold text-slate-900">About</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Main Content */}
          <div className="md:w-2/3 space-y-6 text-slate-600 leading-relaxed text-[15px]">
            <p>
              Learnova is an online learning platform dedicated to making quality education accessible to everyone. Founded in 2024, we partner with educators to deliver practical, career-focused courses.
            </p>
            <p>
              Our mission is to bridge the gap between traditional education and the rapidly evolving demands of the tech industry. We believe learning should be flexible, engaging, and directly applicable to real-world challenges.
            </p>
            
            <div className="pt-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Our approach</h2>
              <p className="mb-4">
                We focus on creating a straightforward and effective learning environment without unnecessary complexity.
              </p>
              <ul className="space-y-3">
                {[
                  "Expert-led courses with real-world projects",
                  "Self-paced learning with lifetime access",
                  "Progress tracking and completion certificates",
                  "Active community support for all learners",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar / Team Info */}
          <div className="md:w-1/3">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900">Our Team</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We are a team of educators and developers based in Mumbai, India. We are passionate about building tools that help people learn and grow in their careers.
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-medium text-slate-900 mb-2">Contact</h4>
                <p className="text-sm text-slate-500">
                  Have questions about our platform? Reach out to us anytime at 
                  <a href="/contact" className="text-indigo-600 hover:underline ml-1">our contact page</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
