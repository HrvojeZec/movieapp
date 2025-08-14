"use client";
import { useEffect } from "react";
import AOS from "aos";

interface AOSProviderProps {
  children: React.ReactNode;
}

export const AOSProvider = ({ children }: AOSProviderProps) => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out-cubic",
      once: true,
      offset: 100,
      delay: 0,
    });

    const handleRouteChange = () => {
      AOS.refresh();
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return <>{children}</>;
};
