"use client";

import { useEffect, useState, ComponentType } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
      null
    );

    useEffect(() => {
      async function checkAuth() {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
      checkAuth();
    }, [router]);

    if (isAuthenticated === null) return <p>Loading...</p>;
    if (!isAuthenticated) return null; // prevent flicker during redirect

    return <WrappedComponent {...props} />;
  };
}
