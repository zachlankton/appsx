import { Btn } from "src/components/Buttons";
import { Input } from "src/components/ValidatorInput";
import { getInviteCode } from "src/lib/AppsxApi";

export function Page() {
  let $inpVal = "";
  const invite = async () => {
    const code = await getInviteCode();
    $inpVal = code.error || code.inviteCode;
  };
  return (
    <div
      onMount={() =>
        (document.head.parentElement!.className = "h-full bg-gray-900")
      }
      class="m-auto mt-10 max-w-96 rounded-lg border bg-white p-4 shadow-md"
    >
      <h1>Invite</h1>
      <Btn class="my-2 w-full" onClick={invite}>
        Generate Invite Code
      </Btn>
      <form>
        <Input
          name="invite_code"
          label="Invite Code"
          value={$inpVal}
          placeholder="Invite Code"
          readonly={true}
        />
      </form>
    </div>
  );
}
