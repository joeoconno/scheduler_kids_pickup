export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-sage-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-medium text-sage-800">HabitHarmony</h1>
        <p className="mt-1 text-sm text-muted">
          A calm space to build better habits, together or on your own.
        </p>
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
