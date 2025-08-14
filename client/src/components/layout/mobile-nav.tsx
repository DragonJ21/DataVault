import { Link, useLocation } from 'wouter';
import { Home, Plane, Briefcase, User } from 'lucide-react';

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/flights', icon: Plane, label: 'Flights' },
    { href: '/career', icon: Briefcase, label: 'Career' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <nav className="flex">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <a className={`flex-1 py-3 px-2 text-center ${
                isActive 
                  ? 'text-primary border-t-2 border-primary' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                <Icon className="h-5 w-5 mx-auto block" />
                <span className="text-xs mt-1 block">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
