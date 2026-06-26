import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

interface StepShellProps {
  title: string;
  description?: string;
  progress: number;
  onBack?: () => void;
  children: ReactNode;
}

export function StepShell({ title, description, progress, onBack, children }: StepShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-4 px-6 py-4">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-muted-foreground shrink-0"
              aria-label="Go back"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
          )}
          <Progress value={progress} className="flex-1" />
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
