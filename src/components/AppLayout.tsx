
import Header from "./Header";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/50 dark:from-background dark:to-background">
      <Header />
      <main className="flex-grow flex flex-col container max-w-3xl mx-auto px-4 py-6">
        <div className="flex justify-end mb-4">
          <Link to="/settings">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </Link>
        </div>
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} GrindTime - Achieve More, Reward Yourself</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default AppLayout;
