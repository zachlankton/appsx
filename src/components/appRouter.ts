import { useRouter } from "rezact/router";
import { Page as FourOhFour } from "./404";

const router = useRouter();

router.addRoute("/404", FourOhFour);

const routes = [
  {
    path: "/",
    component: () => import("src/App"),
    title: "Testing Root Title",
  },
  {
    path: "/page1",
    component: () => import("src/Pages/PageOne"),
    title: "Testing Page Uno",
  },
];

router.addRoutesFromConfig(routes);

export { router };
