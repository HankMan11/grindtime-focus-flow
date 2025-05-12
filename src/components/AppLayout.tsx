
import Header from "./Header";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/50">
      <Header />
      <main className="flex-grow flex flex-col container max-w-3xl mx-auto px-4 py-6">
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
