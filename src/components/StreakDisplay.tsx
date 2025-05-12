
import { Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  dailyGoalMet: boolean;
}

const StreakDisplay = ({ currentStreak, longestStreak, dailyGoalMet }: StreakDisplayProps) => {
  return (
    <div className="glass-card p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-grindtime-purple" />
          Streak
        </h3>
        <span className="badge badge-purple">
          {dailyGoalMet ? "Goal Complete!" : "In Progress"}
        </span>
      </div>
      
      <div className="flex items-center justify-center my-2">
        <div className="text-center mx-4">
          <span className="block text-3xl font-bold">{currentStreak}</span>
          <span className="text-xs text-muted-foreground">Current</span>
        </div>
        <div className="h-10 border-r border-border"></div>
        <div className="text-center mx-4">
          <span className="block text-3xl font-bold">{longestStreak}</span>
          <span className="text-xs text-muted-foreground">Best</span>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span>Today's Goal</span>
          <span>{dailyGoalMet ? "Complete!" : "In Progress"}</span>
        </div>
        <Progress value={dailyGoalMet ? 100 : 0} className="h-2" />
      </div>
    </div>
  );
};

export default StreakDisplay;
