import { Leaf } from "lucide-react";

interface LogoProps {
  collapsed?: boolean;
}

export default function Logo({ collapsed = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-950/30">
        <Leaf size={23} strokeWidth={2.3} />
      </div>

      {!collapsed && (
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            AgriPreserve
          </h1>

          <p className="text-[10px] font-medium tracking-wide text-primary-200">
            COLD CHAIN INTELLIGENCE
          </p>
        </div>
      )}
    </div>
  );
}