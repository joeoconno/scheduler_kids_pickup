import { format } from "date-fns";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/db";
import { JournalForm } from "@/components/journal/journal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function JournalPage() {
  const user = await getCurrentUser();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayEntry, history] = await Promise.all([
    prisma.journalEntry.findUnique({ where: { userId_date: { userId: user.id, date: today } } }),
    prisma.journalEntry.findMany({
      where: { userId: user.id, date: { lt: today } },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Daily Reflection</h1>
        <p className="text-sm text-muted">{format(today, "EEEE, MMMM d")}</p>
      </div>

      <Card>
        <CardContent>
          <JournalForm existing={todayEntry} />
        </CardContent>
      </Card>

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg text-foreground">Past entries</h2>
          {history.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle className="text-base">{format(entry.date, "EEEE, MMMM d")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="font-medium text-muted">Grateful for: </span>
                  {entry.gratitude}
                </p>
                <p>
                  <span className="font-medium text-muted">Showed up: </span>
                  {entry.showedUp}
                </p>
                <p>
                  <span className="font-medium text-muted">Win: </span>
                  {entry.win}
                </p>
                <p>
                  <span className="font-medium text-muted">Growth: </span>
                  {entry.growthArea}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
