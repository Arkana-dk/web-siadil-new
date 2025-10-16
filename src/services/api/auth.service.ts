/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { apiFetch } from "./utils";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    pic?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
}

export interface SessionData {
  user: {
    id: string;
    username: string;
    name: string;
    email?: string;
    pic?: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  accessToken: string;
  expires: string;
}

/**
 * Login to Demplon API
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/api/demplon/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  return response;
}

/**
 * Logout (clear session)
 */
export async function logout(): Promise<void> {
  // Implement logout logic
  // Currently handled by NextAuth
}

/**
 * Verify authentication token
 * @param token - JWT token to verify
 * @returns Promise<boolean> - true if valid, false otherwise
 */
export async function verifyToken(token: string): Promise<boolean> {
  // TODO: Implement token verification with actual API call
  // For now, just check if token exists
  return !!token && token.length > 0;
}

/**
 * Refresh authentication token
 * @param token - Current JWT token
 * @returns Promise<string> - New refreshed token
 */
export async function refreshToken(token: string): Promise<string> {
  // TODO: Implement token refresh logic with actual API call
  // For now, return the same token
  return token;
}
