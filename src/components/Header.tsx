
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

const Header = () => {
  const [activePage, setActivePage] = useState("home");
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b py-3 px-4">
      <div className="container max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl text-grindtime-blue">Grind<span className="text-grindtime-purple">Time</span></span>
        </div>
        
        <nav className="hidden md:flex space-x-6">
          <button 
            onClick={() => setActivePage("home")}
            className={`px-2 py-1 font-medium ${activePage === "home" ? "text-grindtime-blue border-b-2 border-grindtime-blue" : "text-muted-foreground"}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActivePage("homework")}
            className={`px-2 py-1 font-medium ${activePage === "homework" ? "text-grindtime-blue border-b-2 border-grindtime-blue" : "text-muted-foreground"}`}
          >
            Homework
          </button>
          <button 
            onClick={() => setActivePage("stats")}
            className={`px-2 py-1 font-medium ${activePage === "stats" ? "text-grindtime-blue border-b-2 border-grindtime-blue" : "text-muted-foreground"}`}
          >
            Stats
          </button>
        </nav>
        
        <div className="flex items-center space-x-3">
          <Button size="icon" variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-grindtime-purple rounded-full"></span>
          </Button>
          <Avatar className="h-8 w-8 border-2 border-grindtime-green">
            <AvatarFallback className="bg-grindtime-purple/20 text-grindtime-purple">GT</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
