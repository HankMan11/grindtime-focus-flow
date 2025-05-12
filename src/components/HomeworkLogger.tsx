
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Plus } from "lucide-react";

interface HomeworkItem {
  id: string;
  subject: string;
  description: string;
  dueDate: string;
  imageUrl?: string;
  ocrText?: string;
  completed: boolean;
  createdAt: string;
}

const HomeworkLogger = () => {
  const [homeworkItems, setHomeworkItems] = useLocalStorage<HomeworkItem[]>("grindtime-homework", []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [ocrInProgress, setOcrInProgress] = useState(false);
  const [ocrText, setOcrText] = useState("");
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      
      // Simulate OCR processing
      setOcrInProgress(true);
      setTimeout(() => {
        // For demo purposes, we'll simulate OCR with a placeholder text
        const simulatedText = "Math Assignment: Complete problems 1-10 on page 45. Due on Friday.";
        setOcrText(simulatedText);
        setDescription(simulatedText);
        setOcrInProgress(false);
        toast({
          title: "OCR Complete",
          description: "Text extracted from your image!",
        });
      }, 2000);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !description) {
      toast({
        title: "Missing Information",
        description: "Please add a subject and description.",
        variant: "destructive",
      });
      return;
    }
    
    const newHomework: HomeworkItem = {
      id: Date.now().toString(),
      subject,
      description,
      dueDate,
      imageUrl: previewUrl || undefined,
      ocrText,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    
    setHomeworkItems([newHomework, ...homeworkItems]);
    
    // Update stats
    const statsData = JSON.parse(localStorage.getItem("grindtime-stats") || "{}");
    localStorage.setItem("grindtime-stats", JSON.stringify({
      ...statsData,
      homeworkLogged: (statsData.homeworkLogged || 0) + 1,
    }));
    
    // Reset form
    setSelectedImage(null);
    setPreviewUrl(null);
    setSubject("");
    setDescription("");
    setDueDate("");
    setOcrText("");
    setDialogOpen(false);
    
    toast({
      title: "Homework Added",
      description: "Your homework has been saved successfully.",
    });
  };
  
  return (
    <div className="mb-6">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Upload Homework
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log New Homework</DialogTitle>
            <DialogDescription>
              Upload a photo of your assignment or enter details manually.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="image">Upload Image (Optional)</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
            </div>
            
            {previewUrl && (
              <div className="mt-2 relative">
                <img 
                  src={previewUrl} 
                  alt="Homework Preview" 
                  className="w-full h-auto rounded-md object-contain max-h-48"
                />
                {ocrInProgress && (
                  <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                    <div className="text-white text-center">
                      <p className="animate-pulse">Processing image...</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {ocrText && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm font-semibold mb-1">Extracted Text:</p>
                <p className="text-sm">{ocrText}</p>
              </div>
            )}
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Math, Science, History, etc."
                required
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="description">Assignment Details</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you need to do?"
                required
              />
            </div>
            
            <div className="grid w-full gap-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input 
                id="dueDate" 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <DialogFooter>
              <Button type="submit" disabled={ocrInProgress}>
                Save Homework
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {homeworkItems.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-lg mb-3">Recent Homework</h3>
          <div className="space-y-3">
            {homeworkItems.slice(0, 2).map((item) => (
              <Card key={item.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{item.subject}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` : "No due date"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <span className="sr-only">Mark as completed</span>
                      <div className="h-4 w-4 rounded-sm border border-primary"></div>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <p className="text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {homeworkItems.length > 2 && (
            <Button variant="link" className="mt-2 px-0">
              View all ({homeworkItems.length})
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeworkLogger;
