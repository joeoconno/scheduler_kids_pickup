import Link from "next/link";
import { signOut } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";
import { getUserPointsBalance } from "@/lib/points";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calendar/personal", label: "Personal Calendar" },
  { href: "/calendar/shared", label: "Shared Calendar" },
  { href: "/rewards", label: "Rewards" },
  { href: "/journal", label: "Journal" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const points = await getUserPointsBalance(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-card-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="font-display text-xl font-medium text-sage-700">
              HabitHarmony
            </Link>
            <nav className="hidden gap-5 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-sage-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-sage-100 px-3 py-1 text-sm font-medium text-sage-800">
              ✦ {points} pts
            </span>
            {!user.householdId && (
              <Link
                href="/pair"
                className="hidden text-sm font-medium text-lavender-600 hover:text-lavender-700 sm:inline"
              >
                Pair up →
              </Link>
            )}
            <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
        <nav className="flex gap-4 overflow-x-auto border-t border-card-border px-6 py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-muted hover:text-sage-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
