import { MainLayout } from "src/Layout";

export function Page({ router }) {
  console.log(router);
  return (
    <div>
      <h1>Database Page</h1>
    </div>
  );
}

export const Layout = MainLayout;
