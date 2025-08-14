import { Link } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Download, Plane, User } from 'lucide-react';
import { useState } from 'react';
import { ExportModal } from '../export/export-modal';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo and Title */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="p-2 bg-primary rounded-lg">
                  <Plane className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-foreground hidden sm:block">Personal Data Manager</h1>
                <h1 className="text-lg font-semibold text-foreground sm:hidden">PDM</h1>
              </div>
            </Link>

            {/* User Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {/* Export Button */}
              <Button
                onClick={() => setShowExportModal(true)}
                size="sm"
                className="hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={() => setShowExportModal(true)}
                size="sm"
                className="sm:hidden h-9 w-9 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
              
              {/* User Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-9 w-9 p-0"
                title="Logout"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </>
  );
}
