import React from 'react';
import { Link } from 'wouter';
import { HelpCircle, Bell, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '../ui/logo';

interface AppHeaderProps {
  children?: React.ReactNode;
}

const AppHeader: React.FC<AppHeaderProps> = ({ children }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="flex-1 mx-6">
          {children}
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="hidden md:flex items-center text-sm font-medium text-gray-700">
              <span>John Doe</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;