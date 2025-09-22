import React from "react";
import { cn } from "../ui/utils";

interface CardShellProps {
  children: React.ReactNode;
  className?: string;
}

export const CardShell = ({ children, className = "" }: CardShellProps) => {
  return <>{children}</>;
};