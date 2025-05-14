import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useResponsive, useIsMobile } from "@/hooks/use-responsive";
import {
  Bot,
  Layers,
  Activity,
  Shield,
  Database,
  Settings,
  Puzzle,
  CircuitBoard,
  LucideIcon,
  ChevronRight,
  Menu,
  X,
  Wrench,
  MessageSquare,
  BellRing,
  Network,
  Key
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "../ui/logo";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ href, icon: Icon, label, active, collapsed, onClick }: SidebarItemProps) => {
  // If collapsed, only show icon and tooltip
  if (collapsed) {
    return (
      <li className="mb-1 relative group">
        <Link href={href}>
          <div
            className={cn(
              "flex items-center justify-center p-2 rounded-lg font-medium transition-colors",
              active
                ? "text-neutrinos-blue bg-neutrinos-blue/10"
                : "text-slate-700 hover:bg-gray-100"
            )}
            onClick={onClick}
          >
            <Icon className="h-5 w-5" />
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity whitespace-nowrap z-50">
              {label}
            </span>
          </div>
        </Link>
      </li>
    );
  }

  // Regular sidebar item
  return (
    <li className="mb-1">
      <Link href={href}>
        <div
          className={cn(
            "flex items-center p-2 rounded-lg font-medium transition-colors",
            active
              ? "text-neutrinos-blue bg-neutrinos-blue/10"
              : "text-slate-700 hover:bg-gray-100"
          )}
          onClick={onClick}
        >
          <Icon className="h-5 w-5 min-w-[20px]" />
          <span className="ml-3 truncate">{label}</span>
          {/* Subtle right arrow when active */}
          {active && <ChevronRight className="h-4 w-4 ml-auto text-neutrinos-blue/70" />}
        </div>
      </Link>
    </li>
  );
};

interface MobileMenuButtonProps {
  onClick: () => void;
}

const MobileMenuButton = ({ onClick }: MobileMenuButtonProps) => (
  <Button
    variant="ghost"
    size="icon"
    className="md:hidden"
    onClick={onClick}
    aria-label="Menu"
  >
    <Menu className="h-6 w-6" />
  </Button>
);

interface DesktopSidebarProps {
  isActive: (path: string) => boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const DesktopSidebar = ({ isActive, collapsed = false, onToggleCollapse }: DesktopSidebarProps) => (
  <aside 
    className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}
  >
    <div className={cn(
      "p-4 border-b border-gray-200 flex items-center", 
      collapsed ? "justify-center" : "justify-between"
    )}>
      {collapsed ? (
        <div className="h-8 w-8 bg-neutrinos-blue rounded-lg flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
      ) : (
        <>
          <Logo size="sm" />
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={onToggleCollapse}
            aria-label="Collapse Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
    
    <nav className="flex-grow">
      <ul className="p-2">
        <SidebarItem href="/" icon={Layers} label="Agents" active={isActive("/")} collapsed={collapsed} />
        <SidebarItem 
          href="/agents/components" 
          icon={Puzzle} 
          label="Component Models" 
          active={isActive("/agents/components")} 
          collapsed={collapsed} 
        />
        <SidebarItem href="/dashboard" icon={Activity} label="Run Dashboard" active={isActive("/dashboard")} collapsed={collapsed} />
        <SidebarItem href="/governance" icon={Shield} label="Governance" active={isActive("/governance")} collapsed={collapsed} />
        <SidebarItem href="/data-sources" icon={Database} label="Data Sources" active={isActive("/data-sources")} collapsed={collapsed} />
        <SidebarItem href="/data-fabric" icon={CircuitBoard} label="Data Fabric" active={isActive("/data-fabric")} collapsed={collapsed} />
        <SidebarItem href="/tools" icon={Wrench} label="Tools" active={isActive("/tools")} collapsed={collapsed} />
        <SidebarItem href="/triggers" icon={BellRing} label="Triggers" active={isActive("/triggers")} collapsed={collapsed} />
        <SidebarItem href="/agent-orchestration" icon={Network} label="Agent Orchestration" active={isActive("/agent-orchestration")} collapsed={collapsed} />
        <SidebarItem href="/idp" icon={Key} label="Identity Providers" active={isActive("/idp")} collapsed={collapsed} />
        <SidebarItem href="/chat" icon={MessageSquare} label="Chat" active={isActive("/chat")} collapsed={collapsed} />
        <SidebarItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} collapsed={collapsed} />
      </ul>
    </nav>
    
    <div className={cn(
      "border-t border-gray-200",
      collapsed ? "p-2" : "p-4"
    )}>
      <div className={cn(
        "flex items-center", 
        collapsed ? "justify-center" : ""
      )}>
        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium">JD</span>
        </div>
        {!collapsed && (
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">Insurance Solution Engineer</p>
          </div>
        )}
      </div>
    </div>
  </aside>
);

interface MobileSidebarProps {
  isActive: (path: string) => boolean;
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar = ({ isActive, isOpen, onClose }: MobileSidebarProps) => (
  <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <SheetContent side="left" className="p-0 w-72">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <Logo size="sm" />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-grow">
          <ul className="p-3">
            <SidebarItem href="/" icon={Layers} label="Agents" active={isActive("/")} onClick={onClose} />
            <SidebarItem href="/agents/components" icon={Puzzle} label="Component Models" active={isActive("/agents/components")} onClick={onClose} />
            <SidebarItem href="/dashboard" icon={Activity} label="Run Dashboard" active={isActive("/dashboard")} onClick={onClose} />
            <SidebarItem href="/governance" icon={Shield} label="Governance" active={isActive("/governance")} onClick={onClose} />
            <SidebarItem href="/data-sources" icon={Database} label="Data Sources" active={isActive("/data-sources")} onClick={onClose} />
            <SidebarItem href="/data-fabric" icon={CircuitBoard} label="Data Fabric" active={isActive("/data-fabric")} onClick={onClose} />
            <SidebarItem href="/tools" icon={Wrench} label="Tools" active={isActive("/tools")} onClick={onClose} />
            <SidebarItem href="/triggers" icon={BellRing} label="Triggers" active={isActive("/triggers")} onClick={onClose} />
            <SidebarItem href="/agent-orchestration" icon={Network} label="Agent Orchestration" active={isActive("/agent-orchestration")} onClick={onClose} />
            <SidebarItem href="/idp" icon={Key} label="Identity Providers" active={isActive("/idp")} onClick={onClose} />
            <SidebarItem href="/chat" icon={MessageSquare} label="Chat" active={isActive("/chat")} onClick={onClose} />
            
            <Separator className="my-3" />
            
            <SidebarItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} onClick={onClose} />
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Insurance Solution Engineer</p>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

const Sidebar = () => {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { breakpoint } = useResponsive();
  
  // Auto-collapse sidebar on smaller desktop screens
  React.useEffect(() => {
    if (breakpoint === 'lg') {
      setSidebarCollapsed(false);
    } else if (breakpoint === 'md') {
      setSidebarCollapsed(true);
    }
  }, [breakpoint]);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Render mobile menu button and sidebar (sheet) for mobile
  if (isMobile) {
    return (
      <>
        <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
        <MobileSidebar 
          isActive={isActive}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </>
    );
  }

  // Render desktop sidebar
  return (
    <DesktopSidebar 
      isActive={isActive}
      collapsed={sidebarCollapsed}
      onToggleCollapse={toggleSidebar}
    />
  );
};

export default Sidebar;
