"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const RedirectToSignup = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/signup");
  }, [router]);

  return null;
};

export default RedirectToSignup;
