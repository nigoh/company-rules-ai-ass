import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // In development, log the error for debugging
  if (import.meta.env.DEV) {
    console.error('Application Error:', error);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Alert variant="destructive">
          <Warning size={16} />
          <AlertTitle>アプリケーションエラーが発生しました</AlertTitle>
          <AlertDescription>
            予期しないエラーが発生しました。詳細な情報は以下をご確認ください。
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">エラー詳細:</h3>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <Button 
          onClick={resetErrorBoundary}
          className="w-full"
        >
          <ArrowClockwise size={16} className="mr-2" />
          アプリケーションを再起動
        </Button>
      </div>
    </div>
  );
}