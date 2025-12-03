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
          "flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl transition-all duration-200 min-w-[60px] relative",
          primary
            ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            : isActive
              ? "text-primary bg-primary/10 font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )
      }
    >
      {primary && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent opacity-50"></div>
      )}
      <Icon className={cn(
        "relative z-10 transition-transform",
        primary ? "w-7 h-7" : "w-6 h-6"
      )} />
      <span className={cn(
        "text-xs relative z-10 transition-all",
        primary && "font-bold"
      )}>{label}</span>
    </RouterNavLink>
  );
}