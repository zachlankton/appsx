import { getFormData } from "@rezact/rezact/formHelper";
import { MainLayout } from "./Layout";
import { Btn } from "./components/Buttons";
import { Input } from "./components/ValidatorInput";
import { createDatabase, getAccountInfo } from "./lib/AppsxApi";
import { disableForm, enableForm } from "./lib/utils";
import { SpinContainer } from "./components/SpinContainer";
import { Alert } from "./components/Modal";

function getAcct() {
  let $isLoading = true;
  let $error = null;
  let $data: any = [];

  (async () => {
    const data = await getAccountInfo();

    if (data.err) {
      $error = data.err.message;
      return;
    }

    const dbKeys = Object.keys(data.acctInfo.databases);
    const databases = dbKeys.map((key) => ({
      ...data.acctInfo.databases[key],
      id: key,
    }));
    console.log(databases);
    $isLoading = false;
    $data = databases;
  })();
  return [$isLoading, $error, $data];
}

export function Page({ router }) {
  const [$isLoading, $error, $data]: any = getAcct();

  const dbForm: any = { elm: null };
  let $showSpinner = false;
  const createDb = async (ev) => {
    ev.preventDefault();
    if (ev.target.checkValidity()) {
      disableForm(dbForm.elm);
      $showSpinner = true;
      const formData = getFormData(dbForm.elm);
      const response = await createDatabase(formData["db-name"]);
      dbForm.elm.reset();

      if (response.ok) {
        router.push(`/db/${response.newDbId}`);
      } else {
        const errMsg = response.err && response.err.message;
        await Alert(errMsg || response.message || "Error Creating Database");
        $showSpinner = false;
        enableForm(dbForm.elm);
      }
    }
  };

  return (
    <>
      <SpinContainer $showSpinner={$showSpinner} class="bg-white bg-opacity-50">
        <h1>Create Database</h1>
        <form ref={dbForm} onSubmit={createDb}>
          <Input
            placeholder="Database Name"
            required
            pattern={/^[a-zA-Z0-9]{1,24}$/}
            minLength={1}
            maxLength={24}
            label="Database Name"
            name="db-name"
          />
          <Btn class=" mt-2 w-full" type="submit" color="danger" size="xl">
            Create Database
          </Btn>
        </form>
      </SpinContainer>

      <hr class=" my-3 border-slate-500" />
      <h1>Databases</h1>
      {$isLoading && <p>Loading</p>}
      {$error && <p>Error</p>}

      <ul role="list" class="divide-y divide-gray-100">
        {$data.map(($item) => {
          const ownerIds = Object.keys($item.owners);
          const owner = $item.owners[ownerIds[0]];
          const id = $item.id;
          return (
            <li
              onClick={() => {
                router.push(`/db/${id}`);
              }}
              class="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 lg:px-8"
            >
              <div class="flex min-w-0 gap-x-4">
                <div class="min-w-0 flex-auto">
                  <p class="text-sm font-semibold leading-6 text-gray-900">
                    <span class="absolute inset-x-0 -top-px bottom-0"></span>
                    {$item.displayName}
                  </p>
                  <p class="mt-1 flex text-xs leading-5 text-gray-500">
                    {$item.id}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-x-4">
                <div class="hidden sm:flex sm:flex-col sm:items-end">
                  <p class="text-sm leading-6 text-gray-900">
                    DB Owner: {owner.firstName} {owner.lastName}
                  </p>
                  <p class="mt-1 text-xs leading-5 text-gray-500">
                    {owner.email || owner.username}
                  </p>
                </div>
                <svg
                  class="h-5 w-5 flex-none text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export const Layout = MainLayout;
