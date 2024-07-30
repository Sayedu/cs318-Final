// login.js
import { Clerk } from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const clerk = new Clerk(clerkPubKey);
await clerk.load();

const appDiv = document.getElementById("app");

if (clerk.user) {
  window.location.href = '/'; // Redirect to home if already logged in
} else {
  appDiv.innerHTML = `<div id="sign-in"></div>`;
  const signInDiv = document.getElementById("sign-in");
  clerk.mountSignIn(signInDiv);
}
