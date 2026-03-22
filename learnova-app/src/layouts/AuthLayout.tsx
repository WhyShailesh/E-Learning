export default function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 flex items-center justify-center p-4">
      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  );
}
