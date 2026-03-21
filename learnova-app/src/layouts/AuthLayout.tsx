/**
 * AuthLayout — wraps all authentication pages.
 * Forces light theme by explicitly NOT applying the `.dark` class.
 * CSS variables from :root (light) will be used.
 */
export default function AuthLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="light min-h-screen"
      style={{
        colorScheme: "light",
        backgroundColor: "hsl(220 20% 97%)",
        color: "hsl(220 30% 12%)",
      }}
    >
      {children}
    </div>
  );
}
