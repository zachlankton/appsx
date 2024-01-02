import { MainLayout } from "./Layout";
import { Btn } from "./components/Buttons";

export function Page() {
  return (
    <>
      <h1>Hello Making Changes</h1>
      <Btn
        class=" w-full"
        onClick={() => console.log("asdf")}
        color="danger"
        size="xl"
      >
        Test
      </Btn>

      <Btn onClick={() => console.log("asdf")} color="light" size="xs">
        Test
      </Btn>
    </>
  );
}

export const Layout = MainLayout;
