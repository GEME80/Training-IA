"use client";

import React from "react";
import { HeroSection } from "./HeroSection";

interface LandingHeroProps {
  isAuthenticated: boolean;
  onOpenAuthModal?: (tab?: "login" | "register") => void;
  onLoginWithGoogle?: () => void;
  onGoToDashboard?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = (props) => {
  return <HeroSection {...props} />;
};
