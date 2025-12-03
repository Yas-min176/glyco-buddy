import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  primary?: boolean;
}

export function NavLink({ to, icon: Icon, label, primary }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px]",
          primary
            ? "bg-primary text-primary-foreground shadow-lg"
            : isActive
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      <Icon className={cn("w-6 h-6", primary && "w-7 h-7")} />
      <span className="text-xs font-semibold">{label}</span>
    </RouterNavLink>
  );
}