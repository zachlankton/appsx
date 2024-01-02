import { MainLayout } from "src/Layout";
import { clerk } from "src/main";

export function Page() {
  console.log(clerk.user);

  return (
    <>
      <h1>Hello From Page One</h1>
    </>
  );
}

export const Layout = MainLayout;
