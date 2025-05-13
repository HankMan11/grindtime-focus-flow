
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [activePage, setActivePage] = useState("home");
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error logging out");
    } else {
      toast.success("Successfully logged out");
      navigate("/auth");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "GT";
    return user.email.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b py-3 px-4">
      <div className="container max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <span className="font-bold text-xl text-grindtime-blue">Grind<span className="text-grindtime-purple">Time</span></span>
          </Link>
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
          {user ? (
            <>
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-grindtime-purple rounded-full"></span>
              </Button>
              <Avatar className="h-8 w-8 border-2 border-grindtime-green">
                <AvatarFallback className="bg-grindtime-purple/20 text-grindtime-purple">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate('/auth')}>
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
