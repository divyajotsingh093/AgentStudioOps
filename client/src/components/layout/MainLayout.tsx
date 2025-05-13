import { ReactNode, useState } from "react";
import { useResponsive, useIsMobile } from "@/hooks/use-responsive";
import { ResponsiveContainer } from "./ResponsiveContainer";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { breakpoint } = useResponsive();
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="flex min-h-screen flex-col">
          {/* Main content area with responsive padding */}
          <div className="flex-1 px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
            {/* Only apply max width constraints to regular content, not full-screen content */}
            {children}
          </div>
          
          {/* Show footer on larger screens */}
          <footer className="hidden md:block border-t border-gray-200 bg-white py-4 px-6">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div>
                <p>© 2025 Neutrinos AI Agent Platform</p>
              </div>
              <div className="flex space-x-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Support</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default MainLayout;
