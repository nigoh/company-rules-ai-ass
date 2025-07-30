import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary caught an error:', error);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <Warning size={16} />
          <AlertTitle>エラーが発生しました</AlertTitle>
          <AlertDescription>
            アプリケーションでエラーが発生しました。ページを更新するか、しばらく時間をおいてから再度お試しください。
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={resetErrorBoundary}
          variant="outline"
          className="w-full"
        >
          <ArrowClockwise size={16} className="mr-2" />
          再試行
        </Button>
      </div>
    </div>
  );
}