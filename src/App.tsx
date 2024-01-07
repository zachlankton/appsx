import { MainLayout } from "./Layout";
import { Btn } from "./components/Buttons";
import { getSession } from "./lib/ClerkLite";
const apiUrl = import.meta.env.VITE_API_URL;

async function getSess() {
  const { jwt } = await getSession();
  const resp = await fetch(`${apiUrl}/test-jwt`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  console.log(resp.status);
}

export function Page() {
  return (
    <>
      <h1>Hello Making Changes</h1>
      <Btn class=" w-full" onClick={getSess} color="danger" size="xl">
        Test
      </Btn>

      <Btn onClick={() => console.log("asdf")} color="light" size="xs">
        Test
      </Btn>
    </>
  );
}

export const Layout = MainLayout;
