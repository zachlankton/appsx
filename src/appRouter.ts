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
];

router.addRoutesFromConfig(routes);

export { router };
