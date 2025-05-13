import React from "react";

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
}

const Code = React.forwardRef<HTMLPreElement, CodeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <pre
        className={`bg-gray-50 rounded-md p-4 overflow-x-auto text-sm font-mono ${className || ""}`}
        ref={ref}
        {...props}
      >
        {children}
      </pre>
    );
  }
);

Code.displayName = "Code";

export { Code };