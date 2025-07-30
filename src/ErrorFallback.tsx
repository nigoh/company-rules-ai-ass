import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // In development, log the error details
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <Warning size={16} />
          <AlertTitle>アプリケーションエラーが発生しました</AlertTitle>
          <AlertDescription>
            予期しないエラーが発生しました。アプリケーションを再起動してください。
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={resetErrorBoundary}
          className="w-full"
          variant="outline"
        >
          <ArrowClockwise size={16} className="mr-2" />
          アプリケーションを再起動
        </Button>
      </div>
    </div>
  );
}