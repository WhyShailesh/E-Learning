import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { User, Bell, Shield, Globe, Save, Eye, EyeOff, Check } from "lucide-react";
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
        "relative h-5 w-9 rounded-full transition-colors",
        checked ? "bg-indigo-600" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-4"
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
    "h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">Manage your profile and platform preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Section nav */}
        <div className="w-40 shrink-0">
          <nav className="space-y-0.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium text-left transition-colors",
                  activeSection === s.id
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                )}
              >
                <s.icon className={cn("h-4 w-4 shrink-0", activeSection === s.id ? "text-indigo-600" : "text-gray-400")} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {/* Profile */}
          {activeSection === "profile" && (
            <div className="space-y-4">
              <h2 className="text-[13px] font-semibold text-gray-600 border-b border-gray-100 pb-3">Profile Information</h2>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
                  {profileForm.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-800">{profileForm.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Administrator</p>
                </div>
              </div>
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Admin Name" },
                { label: "Email Address", key: "email", type: "email", placeholder: "admin@example.com" },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[12px] font-medium text-gray-500">{field.label}</label>
                  <input
                    type={field.type}
                    value={profileForm[field.key as keyof typeof profileForm]}
                    onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-gray-500">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="space-y-1">
              <h2 className="text-[13px] font-semibold text-gray-600 border-b border-gray-100 pb-3 mb-2">Notification Preferences</h2>
              <div className="divide-y divide-gray-100">
                {[
                  { key: "newEnrollment", label: "New Enrollment", desc: "When a learner enrols in a course" },
                  { key: "courseCompletion", label: "Course Completion", desc: "When a learner completes a course" },
                  { key: "newUser", label: "New User Registration", desc: "When someone creates an account" },
                  { key: "weeklyReport", label: "Weekly Summary", desc: "Platform activity report each week" },
                  { key: "systemAlerts", label: "System Alerts", desc: "Critical platform errors" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-[13px] font-medium text-gray-700">{item.label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
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
            <div className="space-y-4">
              <h2 className="text-[13px] font-semibold text-gray-600 border-b border-gray-100 pb-3">Security Settings</h2>
              {[
                { label: "Current Password", key: "old", show: showOldPw, toggle: () => setShowOldPw(!showOldPw) },
                { label: "New Password", key: "next", show: showNewPw, toggle: () => setShowNewPw(!showNewPw) },
                { label: "Confirm New Password", key: "confirm", show: showNewPw, toggle: () => {} },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[12px] font-medium text-gray-500">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.show ? "text" : "password"}
                      value={passwords[field.key as keyof typeof passwords]}
                      onChange={(e) => setPasswords({ ...passwords, [field.key]: e.target.value })}
                      placeholder="••••••••"
                      className={cn(inputClass, "pr-10")}
                    />
                    <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {field.show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-[12px] text-blue-600">
                Password must be at least 8 characters.
              </div>
            </div>
          )}

          {/* Platform */}
          {activeSection === "platform" && (
            <div className="space-y-4">
              <h2 className="text-[13px] font-semibold text-gray-600 border-b border-gray-100 pb-3">Platform Configuration</h2>
              {[
                { label: "Platform Name", key: "platformName" },
                { label: "Timezone", key: "timezone" },
                { label: "Language", key: "language" },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[12px] font-medium text-gray-500">{field.label}</label>
                  <input
                    type="text"
                    value={platform[field.key as keyof typeof platform] as string}
                    onChange={(e) => setPlatform({ ...platform, [field.key]: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-t border-gray-100">
                <div>
                  <p className="text-[13px] font-medium text-gray-700">Maintenance Mode</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Take the platform offline temporarily</p>
                </div>
                <Toggle
                  checked={platform.maintenanceMode}
                  onChange={() => setPlatform({ ...platform, maintenanceMode: !platform.maintenanceMode })}
                />
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all shadow-sm",
                saved
                  ? "bg-emerald-600 text-white shadow-emerald-600/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
              )}
            >
              {saved ? <><Check className="h-4 w-4" />Saved!</> : <><Save className="h-4 w-4" />Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
