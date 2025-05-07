"use server";

import { redirect } from "next/navigation";

export async function submitForgotPassword(formData) {
  const email = formData.get("email");

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return { message: data.message };
  } catch (error) {
    return { message: "Failed to send reset email" };
  }
}

export async function submitResetPassword(formData) {
  const token = formData.get("token");
  const password = formData.get("password");

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: "Failed to reset password" };
  }
}