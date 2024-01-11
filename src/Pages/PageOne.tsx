import { MainLayout } from "src/Layout";
import { Btn } from "src/components/Buttons";
import { Alert, Confirm, Prompt } from "src/components/Modal";
import { Input } from "src/components/ValidatorInput";

export function Page() {
  const testAlert = async () => {
    const alert = await Alert("Test");
    console.log({ alert });
  };

  const testConfirm = async () => {
    const confirm = await Confirm("Test");
    console.log({ confirm });
  };

  const testPrompt = async () => {
    const prompt = await Prompt(
      <>
        <p>Test Label</p>
        <Input name="test" required label="Test" placeholder="Test" />
      </>,
    );

    if (prompt.ok) {
      await Alert(prompt.data.test);
    } else {
      await Alert("Prompt Cancelled");
    }
  };

  return (
    <>
      <h1>Hello From Page One</h1>
      <div class="flex max-w-40 flex-col gap-2">
        <Btn onClick={testAlert}>Test Alert</Btn>
        <Btn onClick={testConfirm}>Test Confirm</Btn>
        <Btn onClick={testPrompt}>Test Prompt</Btn>
      </div>
    </>
  );
}

export const Layout = MainLayout;
