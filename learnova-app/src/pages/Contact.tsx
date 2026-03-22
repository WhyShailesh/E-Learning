import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-indigo-900/5 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Contact Support</h1>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Your Email Address" 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-colors"
          />
          <textarea 
            placeholder="How can we help?" 
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-colors resize-none"
          ></textarea>
          <button className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 mt-2">
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
