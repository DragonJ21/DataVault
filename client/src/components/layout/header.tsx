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
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Plane className="text-primary text-2xl" />
              </div>
              <div className="ml-3">
                <Link href="/">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white cursor-pointer">Personal Data Manager</h1>
                </Link>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <a className="text-primary border-b-2 border-primary pb-1 px-1 text-sm font-medium">Dashboard</a>
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              
              {/* Export Button */}
              <Button
                onClick={() => setShowExportModal(true)}
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              
              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="flex items-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <ExportModal open={showExportModal} onOpenChange={setShowExportModal} />
    </>
  );
}
