import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import {
  Bot,
  Layers,
  Activity,
  Shield,
  Database,
  Settings,
  LucideIcon
} from "lucide-react";

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const SidebarItem = ({ href, icon: Icon, label, active }: SidebarItemProps) => {
  return (
    <li className="mb-1">
      <Link href={href}>
        <a
          className={cn(
            "flex items-center p-2 rounded-lg font-medium transition-colors",
            active
              ? "text-primary bg-indigo-50"
              : "text-slate-700 hover:bg-gray-100"
          )}
        >
          <Icon className="h-5 w-5 mr-3" />
          <span className="hidden md:block">{label}</span>
        </a>
      </Link>
    </li>
  );
};

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside className="bg-white w-16 md:w-64 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-center md:justify-start">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <span className="hidden md:block ml-3 font-semibold text-lg">Neutrinos</span>
      </div>
      
      <nav className="flex-grow">
        <ul className="p-2">
          <SidebarItem href="/" icon={Layers} label="Agents" active={isActive("/")} />
          <SidebarItem href="/dashboard" icon={Activity} label="Run Dashboard" active={isActive("/dashboard")} />
          <SidebarItem href="/governance" icon={Shield} label="Governance" active={isActive("/governance")} />
          <SidebarItem href="/data-sources" icon={Database} label="Data Sources" active={isActive("/data-sources")} />
          <SidebarItem href="/settings" icon={Settings} label="Settings" active={isActive("/settings")} />
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium">JD</span>
          </div>
          <div className="hidden md:block ml-3">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-500">Insurance Solution Engineer</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
