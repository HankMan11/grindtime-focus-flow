
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Pause, Play, RotateCcw } from "lucide-react";
import useTimer from "@/hooks/useTimer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface FocusTimerProps {
  onComplete?: (focusDuration: number) => void;
}

const TIMER_PRESETS = [
  { name: "25 min", duration: 25 },
  { name: "45 min", duration: 45 },
  { name: "60 min", duration: 60 },
];

const FocusTimer = ({ onComplete }: FocusTimerProps) => {
  const [selectedPreset, setSelectedPreset] = useState(TIMER_PRESETS[0].duration);
  const [customMinutes, setCustomMinutes] = useState(30);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const timer = useTimer({
    initialMinutes: selectedPreset,
    onComplete: () => handleTimerComplete(selectedPreset),
  });

  // Update timer duration when preset changes
  useEffect(() => {
    timer.setTimerDuration(selectedPreset * 60);
  }, [selectedPreset]);
  
  const handleTimerComplete = async (focusDuration: number) => {
    // Show completion toast
    toast({
      title: "Focus session completed!",
      description: `You've completed a ${focusDuration} minute focus session.`,
      variant: "default",
    });
    
    if (onComplete) {
      onComplete(focusDuration);
    }
  };

  const handleCustomSliderChange = (newValue: number[]) => {
    setCustomMinutes(newValue[0]);
  };
  
  const applyCustomDuration = () => {
    setSelectedPreset(customMinutes);
    timer.setTimerDuration(customMinutes * 60);
    timer.resetTimer();
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center mb-6 w-60 h-60">
            {/* Circular progress indicator */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="112"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted stroke-1"
              />
              <circle
                cx="120"
                cy="120"
                r="112"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeLinecap="round"
                className="text-primary"
                strokeDasharray={704}
                strokeDashoffset={704 - (timer.progressPercentage / 100) * 704}
              />
            </svg>
            
            {/* Timer display */}
            <div className="absolute flex flex-col items-center">
              <span className="text-6xl font-bold">{timer.formattedTime}</span>
              <span className="text-sm text-muted-foreground">
                {timer.isActive
                  ? timer.isPaused
                    ? "Paused"
                    : "Focus Time"
                  : `${selectedPreset} min`}
              </span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="flex space-x-4 mb-6">
            {timer.isActive ? (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={timer.resetTimer}
                  className="w-12 h-12 rounded-full p-0"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={timer.isPaused ? timer.resumeTimer : timer.pauseTimer}
                  className="w-20 h-12 rounded-full"
                >
                  {timer.isPaused ? (
                    <Play className="h-5 w-5 mr-1" />
                  ) : (
                    <Pause className="h-5 w-5 mr-1" />
                  )}
                  {timer.isPaused ? "Resume" : "Pause"}
                </Button>
              </>
            ) : (
              <Button
                size="lg"
                onClick={timer.startTimer}
                className="w-32 h-12 rounded-full bg-grindtime-blue hover:bg-grindtime-blue/90"
              >
                <Play className="h-5 w-5 mr-1" /> Start Focus
              </Button>
            )}
          </div>

          {/* Presets and custom duration */}
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="presets">Quick Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom Duration</TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                {TIMER_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant={selectedPreset === preset.duration ? "default" : "outline"}
                    className={selectedPreset === preset.duration ? "bg-grindtime-blue hover:bg-grindtime-blue/90" : ""}
                    onClick={() => {
                      setSelectedPreset(preset.duration);
                      timer.setTimerDuration(preset.duration * 60);
                      timer.resetTimer();
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Duration: {customMinutes} minutes</span>
                </div>
                <Slider
                  value={[customMinutes]}
                  min={5}
                  max={120}
                  step={5}
                  onValueChange={handleCustomSliderChange}
                />
                <Button onClick={applyCustomDuration} className="w-full bg-grindtime-blue hover:bg-grindtime-blue/90">
                  Apply Custom Duration
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default FocusTimer;
