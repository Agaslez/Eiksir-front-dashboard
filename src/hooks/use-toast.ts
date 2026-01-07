/**
 * Toast hook - Simple toast notifications
 */

type ToastType = 'default' | 'destructive';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastType;
}

export const useToast = () => {
  const toast = (options: ToastOptions) => {
    // Simple alert for now - in production, this would use a toast library
    const message = options.description 
      ? `${options.title}\n${options.description}`
      : options.title;
    
    if (options.variant === 'destructive') {
      console.error(message);
      alert(`❌ ${message}`);
    } else {
      console.log(message);
      alert(`✅ ${message}`);
    }
  };

  return { toast };
};
