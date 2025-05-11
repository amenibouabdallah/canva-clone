import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = process.env.API_URL || "http://localhost:5004";
console.log("API_URL:", API_URL);
console.log("Environment:", process.env.API_URL);
export async function fetchWithAuth(endpoint, options = {}) {
  const session = await getSession();

  if (!session) {
    console.error("Session is null or invalid");
    throw new Error("Not authenticated");
  }
  console.log("Session:", session);
  console.log("Token:", session.idToken);
  console.log("Authorization header:", `Bearer ${session.idToken}`);

  console.log("Making request to:", `${API_URL}${endpoint}`);
  console.log("Request headers:", {
    Authorization: `Bearer ${session.idToken}`,
    ...options.headers,
  });

  try {
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${session.idToken}`, // Ensure this is set
        ...options.headers,
      },
      data: options.body,
      params: options.params,
    });

    return response.data;
  } catch (error) {
    console.error("API request failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
    throw new Error("Api request failed");
  }
}
