import { Btn } from "src/components/Buttons";
import { getFormData } from "@rezact/rezact/formHelper";
import { Input } from "src/components/ValidatorInput";

import { signOut } from "src/lib/ClerkLite";
import { createAccountWithInvite } from "src/lib/AppsxApi";
import { router } from "src/appRouter";
import { elmRef } from "src/lib/utils";

export function Page() {
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const form = ev.target;
    if (form.checkValidity()) {
      const data = getFormData(form);
      const results = await createAccountWithInvite(data.invite_code);
      console.log(results);
      if (results.ok) {
        router.routeRequest("/");
      } else {
        alert(results.message);
      }
    }
  };

  const mobileSidebarParentRef = new elmRef();
  const mobileSideBarRef = new elmRef();
  const sidebarBackdropRef = new elmRef();

  const mobileSidebarClick = () => {
    mobileSidebarParentRef.show();
    setTimeout(() => {
      console.log(mobileSideBarRef);
      sidebarBackdropRef.transition("opacity-0", "opacity-100");
      mobileSideBarRef.transition("translate-x-full", "translate-x-0");
      mobileSidebarParentRef.addClick(closeMobileSidebar);
    }, 10);
  };

  const closeMobileSidebar = () => {
    sidebarBackdropRef.transition("opacity-100", "opacity-0");
    mobileSideBarRef.transition("translate-x-0", "translate-x-full");
    setTimeout(() => {
      mobileSidebarParentRef.hide();
      mobileSidebarParentRef.removeClick(closeMobileSidebar);
    }, 310);
  };
  return (
    <div>
      <header class="absolute inset-x-0 top-0 z-50">
        <nav
          class="flex items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div class="flex lg:flex-1">
            <a href="/" class="-m-1.5 p-1.5 text-white">
              <span class="sr-only">Apps Ex</span>
              🍑 AppsX
            </a>
          </div>
          <div class="flex lg:hidden">
            <button
              type="button"
              onClick={mobileSidebarClick}
              class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
            >
              <span class="sr-only">Open main menu</span>
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
          <div class="hidden lg:flex lg:gap-x-12">
            {/* <a href="#" class="text-sm font-semibold leading-6 text-white">
              Product
            </a>
            <a href="#" class="text-sm font-semibold leading-6 text-white">
              Features
            </a>
            <a href="#" class="text-sm font-semibold leading-6 text-white">
              Pricing
            </a> */}
          </div>
          <div class="hidden lg:flex lg:flex-1 lg:justify-end">
            <a
              href="#"
              onClick={async () => {
                await signOut();
                location.reload();
              }}
              class="text-sm font-semibold leading-6 text-white"
            >
              Log out <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </nav>
        {/* <!-- Mobile menu, show/hide based on menu open state. --> */}
        <div
          ref={mobileSidebarParentRef}
          class="hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* <!-- Background backdrop, show/hide based on slide-over state. --> */}
          <div
            ref={sidebarBackdropRef}
            class="fixed inset-0 z-50 bg-gray-900/80 opacity-0 transition-opacity duration-300 ease-linear"
          ></div>
          <div
            ref={mobileSideBarRef}
            class="fixed inset-y-0 right-0 z-50 w-full translate-x-full overflow-y-auto bg-gray-900 px-6 py-6 transition duration-300 ease-in-out sm:max-w-sm sm:ring-1 sm:ring-white/10"
          >
            <div class="flex items-center justify-between">
              <a href="#" class="-m-1.5 p-1.5 text-white">
                <span class="sr-only">Apps Ex</span>
                🍑 AppsX
              </a>
              <button
                type="button"
                onClick={closeMobileSidebar}
                class="-m-2.5 rounded-md p-2.5 text-gray-400"
              >
                <span class="sr-only">Close menu</span>
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div class="mt-6 flow-root">
              <div class="-my-6 divide-y divide-gray-500/25">
                {/* <div class="space-y-2 py-6">
                  <a
                    href="#"
                    class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                  >
                    Product
                  </a>
                  <a
                    href="#"
                    class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                  >
                    Pricing
                  </a>
                </div> */}
                <div class="py-6">
                  <a
                    href="#"
                    onClick={async () => {
                      await signOut();
                      location.reload();
                    }}
                    class="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-800"
                  >
                    Log out
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div class="relative isolate pt-14">
        <div
          class="m-auto bg-white shadow sm:mt-10 sm:w-[600px] sm:rounded-lg "
          onMount={() =>
            (document.head.parentElement!.className = "h-full bg-gray-900")
          }
        >
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-base font-semibold leading-6 text-gray-900">
              New Account
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Please paste or enter your invite code</p>
            </div>
            <form class="mt-5 " onSubmit={handleSubmit}>
              <div class="w-full">
                <Input
                  name="invite_code"
                  label="Invite Code"
                  placeholder="invite_xxxxxxx"
                  required={true}
                  exactLength={29}
                  pattern={/^invite_[a-zA-Z0-9]{22}$/}
                />
              </div>
              <Btn type="submit" size="lg" class="mt-2 w-full">
                Submit
              </Btn>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
