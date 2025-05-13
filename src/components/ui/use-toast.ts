
import { useToast, toast } from "@/hooks/use-toast";
import type { ToastProps } from "@/components/ui/toast";

// Override toast behavior for mobile when needed
const showMobileToast = (message: string, options: Partial<ToastProps> = {}) => {
  if (typeof window !== 'undefined') {
    toast({
      description: message,
      ...options
    });
  }
};

export { useToast, toast, showMobileToast };
