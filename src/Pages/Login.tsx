import { Btn } from "src/components/Buttons";
import { signIn } from "src/lib/ClerkLite";

export function Page() {
  return (
    <div class=" w-[455px] m-auto pt-24">
      <Btn className="w-full" onClick={() => signIn()}>
        Sign In with GitHub
      </Btn>
    </div>
  );
}
