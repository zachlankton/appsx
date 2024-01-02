import { clerk } from "src/main";

await clerk.load();

export function Page() {
  const mountSignIn = (elm) => {
    clerk.mountSignIn(elm, {
      // appearance: {
      //   elements: {
      //     formButtonPrimary: "bg-slate-500",
      //   },
      // },
    });
  };

  return (
    <div class=" w-[455px] m-auto pt-24">
      <div onMount={mountSignIn}></div>
    </div>
  );
}
