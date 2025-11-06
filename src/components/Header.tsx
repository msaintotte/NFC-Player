import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { APP_VERSION, BUILD_TIMESTAMP } from '@/config/version';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-foreground rounded-full flex items-center justify-center">
            <span className="text-primary text-2xl font-bold">P</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">PUDIS</h1>
            <p className="text-xs opacity-90">Magic Music Player</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-mono opacity-90">v{APP_VERSION}</span>
            <span className="text-[10px] font-mono opacity-70">
              {BUILD_TIMESTAMP}
            </span>
          </div>
          
          <Link to="/settings">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-primary-foreground hover:bg-primary-600"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
