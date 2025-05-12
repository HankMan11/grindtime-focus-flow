
import { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Award, Timer } from "lucide-react";

interface Stats {
  totalFocusTime: number; // in minutes
  totalRewardTime: number; // in minutes
  sessionsCompleted: number;
  homeworkLogged: number;
}

const StatsCard = () => {
  const [stats, setStats] = useLocalStorage<Stats>("grindtime-stats", {
    totalFocusTime: 0,
    totalRewardTime: 0,
    sessionsCompleted: 0,
    homeworkLogged: 0,
  });
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Sample data for testing - remove in production
  useEffect(() => {
    if (stats.totalFocusTime === 0) {
      setStats({
        totalFocusTime: 125, // 2h 5m
        totalRewardTime: 25,
        sessionsCompleted: 5,
        homeworkLogged: 3,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-grindtime-blue" />
            Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">{formatTime(stats.totalFocusTime)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Timer className="h-4 w-4 text-grindtime-green" />
            Reward Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">{formatTime(stats.totalRewardTime)}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <Award className="h-4 w-4 text-grindtime-purple" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">{stats.sessionsCompleted}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium flex items-center gap-1.5">
            <span className="font-sans">📝</span>
            Homework
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xl font-bold">{stats.homeworkLogged}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCard;
