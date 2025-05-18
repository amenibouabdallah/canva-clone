"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import axios from "axios";

export default function UserUpsert() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      // Log the full session object for debugging
      console.log("Full session object:", session);
      // Try to get googleId from token if not present in user
      const googleId = session.user.sub || session.user.id || session.user.googleId || session.idToken;
      if (!googleId || !session.user.email) {
        console.error("Still missing googleId or email", session.user, session);
        return;
      }
      axios.post("http://localhost:5004/auth/google-login", {
        googleId,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      }).catch((err) => {
        console.error("User upsert failed", err);
      });
    }
  }, [session, status]);

  return null;
}
