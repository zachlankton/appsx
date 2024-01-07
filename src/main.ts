import { router } from "./appRouter";
import {
  getClient,
  session,
  setClerkDev,
  setClerkDomain,
} from "./lib/ClerkLite";

if (import.meta.env.DEV) {
  setClerkDev();
}
setClerkDomain(import.meta.env.VITE_CLERK_DOMAIN);

const test = getClient();
router.beforeEach(async (to) => {
  await test;

  if (session) {
    const accounts = session.user.public_metadata.accounts;
    if (!accounts) return "/new-account";
    const accountIds = Object.keys(accounts);
    if (accountIds.length === 0) return "/new-account";
  }

  if (session && to.pathname === "/login") return "/";
  if (session) return to.pathname;

  return "/landing";
  // location.assign(import.meta.env.VITE_SIGN_IN_URL);
});

router.routeChanged();
