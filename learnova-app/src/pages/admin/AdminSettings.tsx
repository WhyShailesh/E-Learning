import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Shield, Globe, Save, Eye, EyeOff, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Section = "profile" | "notifications" | "security" | "platform";

const sections: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "platform", label: "Platform", icon: Globe },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 rounded-full transition-all duration-300 border border-white/60 shadow-inner",
        checked ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-indigo-600/30" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-md transition-transform duration-300",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "Admin",
    email: user?.email || "admin@learnova.com",
    bio: "Platform administrator for Learnova.",
  });

  const [notifications, setNotifications] = useState({
    newEnrollment: true,
    courseCompletion: true,
    newUser: false,
    weeklyReport: true,
    systemAlerts: true,
  });

  const [platform, setPlatform] = useState({
    platformName: "Learnova",
    timezone: "Asia/Kolkata",
    language: "English",
    maintenanceMode: false,
  });

  const [passwords, setPasswords] = useState({ old: "", next: "", confirm: "" });

  const handleSave = () => {
    toast.success("Settings saved");
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    "h-14 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner";

  return (
    <div className="space-y-8 font-sans relative z-10 w-full max-w-5xl">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl shadow-indigo-900/5 overflow-hidden relative group transition-all">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
            Platform Configuration
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-500 max-w-xl">
            Administer global settings, refine security protocols, and manage notification matrices.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Section Nav */}
        <div className="w-full md:w-56 shrink-0 relative z-10">
          <nav className="space-y-2 sticky top-24">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-bold text-left transition-all duration-300",
                  activeSection === s.id
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5 border border-transparent"
                    : "bg-white/60 backdrop-blur-md text-gray-500 hover:bg-white hover:text-gray-900 border border-white/80 shadow-sm hover:shadow-md"
                )}
              >
                <s.icon className={cn("h-5 w-5 shrink-0 transition-colors", activeSection === s.id ? "text-white" : "text-gray-400 group-hover:text-indigo-500")} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-8 shadow-xl shadow-indigo-900/5 relative z-10 overflow-hidden">
          
          {/* Profile */}
          {activeSection === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-sm font-extrabold text-gray-800 border-b border-gray-100/60 pb-4 uppercase tracking-widest">
                Profile Architecture
              </h2>
              
              <div className="flex items-center gap-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 rounded-3xl border border-white shadow-inner">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xl font-black text-white shadow-lg shadow-indigo-600/30">
                  {profileForm.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-lg font-extrabold text-gray-900 tracking-tight">{profileForm.name}</p>
                  <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Primary Architect</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Nominal Designation", key: "name", type: "text", placeholder: "Admin Name" },
                  { label: "Secure Email Address", key: "email", type: "email", placeholder: "admin@learnova.edu" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{field.label}</label>
                    <input
                      type={field.type}
                      value={profileForm[field.key as keyof typeof profileForm]}
                      onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Global Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-inner"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-2 animate-fade-in">
              <h2 className="text-sm font-extrabold text-gray-800 border-b border-gray-100/60 pb-4 uppercase tracking-widest mb-4">
                Notification Matrix
              </h2>
              <div className="divide-y divide-gray-100/60 bg-white border border-gray-100/60 rounded-3xl px-6 shadow-sm">
                {[
                  { key: "newEnrollment", label: "Enrollment Events", desc: "Trigger sequence on learner admission" },
                  { key: "courseCompletion", label: "Graduation Subroutines", desc: "Trigger sequence on curricular completion" },
                  { key: "newUser", label: "New Node Registration", desc: "Notify upon user database expansion" },
                  { key: "weeklyReport", label: "Analytics Summary", desc: "Weekly compilation of KPI trajectories" },
                  { key: "systemAlerts", label: "Critical Anomalies", desc: "Bypass standard filters for strict platform alerts" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-5 group">
                    <div>
                      <p className="text-sm font-extrabold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">{item.label}</p>
                      <p className="text-[12px] font-medium text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === "security" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-sm font-extrabold text-gray-800 border-b border-gray-100/60 pb-4 uppercase tracking-widest">
                Cryptographic Credentials
              </h2>
              <div className="space-y-6 max-w-lg">
                {[
                  { label: "Active Cipher", key: "old", show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                  { label: "Pending Cipher", key: "next", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                  { label: "Verify Pending Cipher", key: "confirm", show: showNewPw, toggle: () => {} },
                ].map((field) => (
                  <div key={field.key} className="space-y-2 flex-col">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{field.label}</label>
                    <div className="relative">
                      <input
                        type={field.show ? "text" : "password"}
                        value={passwords[field.key as keyof typeof passwords]}
                        onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                        placeholder="••••••••••••"
                        className={cn(inputClass, "pr-12")}
                      />
                      <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors">
                        {field.show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 text-[12px] font-bold text-indigo-700 flex items-center gap-2 max-w-lg">
                <Shield className="h-4 w-4" />
                Algorithm necessitates minimum 8 encrypted characters.
              </div>
            </div>
          )}

          {/* Platform */}
          {activeSection === "platform" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-sm font-extrabold text-gray-800 border-b border-gray-100/60 pb-4 uppercase tracking-widest">
                Core Variables
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: "System Identifier", key: "platformName" },
                  { label: "Temporal Origin", key: "timezone" },
                  { label: "Linguistic Base", key: "language" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-500">{field.label}</label>
                    <input
                      type="text"
                      value={platform[field.key as keyof typeof platform] as string}
                      onChange={(e) => setPlatform({ ...platform, [field.key]: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between p-6 mt-4 bg-rose-50/50 rounded-3xl border border-rose-100/50">
                <div>
                  <p className="text-sm font-extrabold text-gray-900 leading-tight">Maintenance Suspension</p>
                  <p className="text-[12px] font-medium text-gray-500 mt-1 max-w-sm">
                    Temporarily close external network portals for systemic upgrades. Users will observe a holding screen.
                  </p>
                </div>
                <Toggle
                  checked={platform.maintenanceMode}
                  onChange={() => setPlatform({ ...platform, maintenanceMode: !platform.maintenanceMode })}
                />
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-10 flex justify-end border-t border-gray-100/60 pt-6">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-extrabold transition-all shadow-lg hover:-translate-y-0.5",
                saved
                  ? "bg-emerald-600 text-white shadow-emerald-600/30"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/30"
              )}
            >
              {saved ? <><Check className="h-5 w-5" />Synchronized</> : <><Sparkles className="h-5 w-5" />Deploy Modifications</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
