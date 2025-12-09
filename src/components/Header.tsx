import { GraduationCap, HelpCircle, Mic, Monitor } from 'lucide-react';
import { Timer } from './Timer';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  startTime: Date | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Header({ startTime, isDark, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-soft">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">GRE Check-In</h1>
            <p className="text-xs text-muted-foreground">AI Proctored Session</p>
          </div>
        </div>

        {/* Center: Timer & Status */}
        <div className="flex items-center gap-4">
          <Timer startTime={startTime} />
          
          <div className="hidden md:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
                  <Monitor className="w-3.5 h-3.5 text-success" />
                  <span className="text-xs font-medium text-success">Screen Active</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Screen recording is active</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Mic Ready</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Microphone permission required</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HelpCircle className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Get Help</TooltipContent>
          </Tooltip>
          
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
