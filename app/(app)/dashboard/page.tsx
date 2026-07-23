import { getCurrentUser } from "@/lib/current-user";
import { getWeekRange } from "@/lib/week";
import { getWeeklyReport } from "@/lib/points";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const range = getWeekRange();
  const report = await getWeeklyReport(user.id, user.householdId, range.start, range.end);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-foreground">Your Growth Report</h1>
        <p className="text-sm text-muted">{range.label}</p>
      </div>

      <Card className="bg-sage-50/60">
        <CardContent>
          <p className="font-display text-lg text-sage-800">{report.encouragement}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal consistency</CardTitle>
            <CardDescription>
              {report.personalCompleted} of {report.personalTotal} practices this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar value={report.personalCompletionRate} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current streak</CardTitle>
            <CardDescription>Consecutive days with a completed practice</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-sage-700">{report.streak} days</p>
          </CardContent>
        </Card>

        {user.householdId && (
          <Card>
            <CardHeader>
              <CardTitle>Shared goals</CardTitle>
              <CardDescription>
                {report.sharedCompleted} of {report.sharedTotal} shared goals this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgressBar value={report.sharedCompletionRate} tone="lavender" />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Points earned</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl text-sage-700">{report.pointsEarnedThisWeek}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
