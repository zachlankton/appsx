import { MainLayout } from "src/Layout";
import { CodeEditor } from "src/components/CodeEditor";

export function Page({ router }) {
  console.log(router);
  return (
    <div>
      <h1>Database Page</h1>
      <CodeEditor />
    </div>
  );
}

export const Layout = MainLayout;
