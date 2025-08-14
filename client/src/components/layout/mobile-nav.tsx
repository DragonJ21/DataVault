import { Link, useLocation } from 'wouter';
import { Home, Plane, Briefcase, User } from 'lucide-react';

export function MobileNav() {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-pb">
      <div className="px-4 py-2">
        <div className="text-xs text-center text-muted-foreground">
          Swipe up for more options
        </div>
      </div>
    </div>
  );
}
