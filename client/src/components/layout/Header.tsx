import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const Header = ({
  title,
  subtitle,
  icon,
  actions,
  className
}: HeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between py-4 px-6",
        className
      )}
    >
      <div className="flex items-center">
        {icon && <div className="mr-3">{icon}</div>}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      
      {actions && <div className="mt-4 md:mt-0">{actions}</div>}
    </div>
  );
};

export default Header;
