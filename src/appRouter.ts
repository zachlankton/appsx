import { useRouter } from "rezact/router";
import { Page as FourOhFour } from "./Pages/404";

const router = useRouter();

router.addRoute("/404", FourOhFour);

const routes = [
  {
    path: "/",
    component: () => import("src/App"),
    title: "AppsX",
  },
  {
    path: "/landing",
    component: () => import("src/Pages/LandingPage"),
    title: "AppsX",
  },
  {
    path: "/page1",
    component: () => import("src/Pages/PageOne"),
    title: "AppsX",
  },
  {
    path: "/new-account",
    component: () => import("src/Pages/NewAccount"),
    title: "AppsX",
  },

  {
    path: "/invite",
    component: () => import("src/Pages/Invite"),
    title: "AppsX Invite",
  },
  {
    path: "/db/:dbID",
    component: () => import("src/Pages/Database"),
    title: "AppsX DB",
  },

  {
    path: "/users",
    component: () => import("src/Pages/Users"),
    title: "AppsX Users",
  },
];

router.addRoutesFromConfig(routes);

export { router };
