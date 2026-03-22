import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Contact() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Thanks for reaching out! We'll reply soon.");
      setLoading(false);
      (e.target as HTMLFormElement).reset();
    }, 600);
  };

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-5xl">

        <div className="mb-12 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold text-slate-900">Contact</h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">

          {/* Left Side: Contact Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <p className="text-slate-600">
                If you have questions about a course, technical issues, or just want to say hi, feel free to drop us a line.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {[
                { icon: Mail, label: "Email", value: "support@learnova.in" },
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: MapPin, label: "Office", value: "Andheri West, Mumbai, MH 400058" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <item.icon className="h-4 w-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  <p className="text-slate-600 pl-6">{item.value}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-100 rounded-md p-4 mt-8 border border-slate-200">
               <h3 className="text-sm font-medium text-slate-900 mb-1">Support Hours</h3>
               <p className="text-sm text-slate-600">Monday - Friday: 9AM - 6PM IST</p>
               <p className="text-sm text-slate-600">We typically reply within 24 hours.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>Name</label>
                <input type="text" placeholder="Jane Doe" required className={inputClass} />
              </div>
              
              <div className="space-y-1">
                <label className={labelClass}>Email address</label>
                <input type="email" placeholder="jane@example.com" required className={inputClass} />
              </div>
              
              <div className="space-y-1">
                <label className={labelClass}>Message</label>
                <textarea 
                  placeholder="How can we help you?" 
                  rows={5} 
                  required 
                  className={`${inputClass} resize-y min-h-[120px]`} 
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-2" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
