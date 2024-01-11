import { MainLayout } from "src/Layout";

export function Page({ router }) {
  console.log(router);
  return (
    <div>
      <h1>Users Page</h1>
    </div>
  );
}

export const Layout = MainLayout;
