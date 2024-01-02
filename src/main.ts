import { router } from "./appRouter";
import Clerk from "@clerk/clerk-js";

const clerk = new Clerk(
  "pk_test_dmVyaWZpZWQtZmx5LTEuY2xlcmsuYWNjb3VudHMuZGV2JA"
);
const test = clerk.load();

export { clerk };

router.beforeEach(async (to, from) => {
  console.log("beforeEach", { to, from });
  await test;
  if (clerk.session) return to.pathname;
  return "/login";
});

router.routeChanged();
