import { DatabaseIcon, SettingsIcon, UsersIcon } from "./components/icons";
import { addClerkChangeHook, signOut } from "./lib/ClerkLite";
import { elmRef } from "./lib/utils";
// import "boxicons";

import "./styles.css";
let $userImageUrl = "";
let $userFirstName = "";

addClerkChangeHook((event, user) => {
  if (event === "signIn" || event === "getClient") {
    $userImageUrl = user.image_url || "";
    $userFirstName = user.first_name;
  }
});

export function MainLayout({ router }) {
  const mobileSidebarParentRef = new elmRef();
  const mobileSideBarRef = new elmRef();
  const mobileCloseButtonRef = new elmRef();
  const sidebarBackdropRef = new elmRef();
  const userMenuRef = new elmRef();
  const body = new elmRef(document.body);

  const openUserMenu = () => {
    if (!userMenuRef.elm.classList.contains("hidden")) return;
    userMenuRef.show();
    userMenuRef.transition("opacity-0 scale-95", "opacity-100 scale-100", 100);
    body.addClick(closeUserMenu);
  };

  const closeUserMenu = () => {
    userMenuRef.transition("opacity-100 scale-100", "opacity-0 scale-95");
    userMenuRef.hide(110);
    body.removeClick(closeUserMenu);
  };

  const mobileSidebarClick = () => {
    mobileSidebarParentRef.show();

    sidebarBackdropRef.transition("opacity-0", "opacity-100", 100);
    mobileSideBarRef.transition("-translate-x-full", "translate-x-0", 100);
    mobileCloseButtonRef.transition("opacity-0", "opacity-100", 100);
    mobileSidebarParentRef.addClick(closeMobileSidebar);
  };
  const closeMobileSidebar = () => {
    sidebarBackdropRef.transition("opacity-100", "opacity-0");
    mobileSideBarRef.transition("translate-x-0", "-translate-x-full");
    mobileCloseButtonRef.transition("opacity-100", "opacity-0");
    mobileSidebarParentRef.hide(310);
    mobileSidebarParentRef.removeClick(closeMobileSidebar);
  };
  return (
    <>
      <div
        onMount={() =>
          (document.head.parentElement!.className = "h-full bg-zinc-200")
        }
      >
        {/* <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. --> */}
        <div
          class="relative z-40 hidden"
          ref={mobileSidebarParentRef}
          role="dialog"
          aria-modal="true"
        >
          {/* <!--
      Off-canvas menu backdrop, show/hide based on off-canvas menu state.

      Entering: "transition-opacity ease-linear duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "transition-opacity ease-linear duration-300"
        From: "opacity-100"
        To: "opacity-0"
    --> */}
          <div
            class="fixed inset-0 bg-gray-900/80 opacity-0 transition-opacity duration-300 ease-linear"
            ref={sidebarBackdropRef}
          ></div>

          <div class="fixed inset-0 flex">
            {/* <!--
        Off-canvas menu, show/hide based on off-canvas menu state.

        Entering: "transition ease-in-out duration-300 transform"
          From: "-translate-x-full"
          To: "translate-x-0"
        Leaving: "transition ease-in-out duration-300 transform"
          From: "translate-x-0"
          To: "-translate-x-full"
      --> */}
            <div
              ref={mobileSideBarRef}
              class=" relative mr-16 flex w-full max-w-xs flex-1 -translate-x-full transition duration-300 ease-in-out"
            >
              {/* <!--
          Close button, show/hide based on off-canvas menu state.

          Entering: "ease-in-out duration-300"
            From: "opacity-0"
            To: "opacity-100"
          Leaving: "ease-in-out duration-300"
            From: "opacity-100"
            To: "opacity-0"
        --> */}
              <div
                ref={mobileCloseButtonRef}
                class=" absolute left-full top-0 flex w-16 justify-center pt-5 opacity-0 transition duration-300 ease-in-out"
              >
                <button
                  onClick={closeMobileSidebar}
                  type="button"
                  class="-m-2.5 p-2.5"
                >
                  <span class="sr-only">Close sidebar</span>
                  <svg
                    class="h-6 w-6 text-white"
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

              {/* <!-- Sidebar component, swap this element with another sidebar if you like --> */}
              <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4 ring-1 ring-white/10">
                <a
                  href="/landing"
                  class="flex h-16 shrink-0 items-center text-white"
                >
                  <span class="sr-only">Apps Ex</span>
                  🍑 AppsX
                </a>
                <nav class="flex flex-1 flex-col">
                  <ul role="list" class="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" class="-mx-2 space-y-1">
                        <li>
                          {/* <!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" --> */}
                          <a
                            href="/"
                            class="group flex gap-x-3 rounded-md bg-gray-800 p-2 text-sm font-semibold leading-6 text-white"
                          >
                            <DatabaseIcon class="h-6 w-6 shrink-0" />
                            Databases
                          </a>
                        </li>
                        <li>
                          <a
                            href="/users"
                            class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                          >
                            <UsersIcon class="h-6 w-6 shrink-0" />
                            Users
                          </a>
                        </li>
                      </ul>
                    </li>

                    <li class="mt-auto">
                      <a
                        href="/page1"
                        class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <SettingsIcon class="h-6 w-6 shrink-0" />
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Static sidebar for desktop --> */}
        <div
          id="test"
          class="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col"
        >
          {/* <!-- Sidebar component, swap this element with another sidebar if you like --> */}
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-4">
            <a
              href="/landing"
              class="flex h-16 shrink-0 items-center text-white"
            >
              <span class="sr-only">Apps Ex</span>
              🍑 AppsX
            </a>
            <nav class="flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" class="-mx-2 space-y-1">
                    <li>
                      {/* <!-- Current: "bg-gray-800 text-white", Default: "text-gray-400 hover:text-white hover:bg-gray-800" --> */}
                      <a
                        href="/"
                        class="group flex gap-x-3 rounded-md bg-gray-800 p-2 text-sm font-semibold leading-6 text-white"
                      >
                        <DatabaseIcon class="h-6 w-6 shrink-0" />
                        Databases
                      </a>
                    </li>
                    <li>
                      <a
                        href="/users"
                        class="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                      >
                        <UsersIcon class="h-6 w-6 shrink-0" />
                        Users
                      </a>
                    </li>
                  </ul>
                </li>

                <li class="mt-auto">
                  <a
                    href="/page1"
                    class="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    <SettingsIcon class="h-6 w-6 shrink-0" />
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div class="lg:pl-72">
          <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              onClick={mobileSidebarClick}
              type="button"
              class="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span class="sr-only">Open sidebar</span>
              🍑
            </button>

            {/* <!-- Separator --> */}
            <div
              class="h-6 w-px bg-gray-900/10 lg:hidden"
              aria-hidden="true"
            ></div>

            <div class="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <div class="relative flex flex-1"></div>
              <div class="flex items-center gap-x-4 lg:gap-x-6">
                {/* <!-- Profile dropdown --> */}
                <div class="relative">
                  <button
                    onClick={openUserMenu}
                    type="button"
                    class="-m-1.5 flex items-center p-1.5"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span class="sr-only">Open user menu</span>
                    <img
                      class="h-8 w-8 rounded-full bg-gray-50"
                      src={$userImageUrl}
                      alt=""
                    />
                    <span class="hidden lg:flex lg:items-center">
                      <span
                        class="ml-4 text-sm font-semibold leading-6 text-gray-900"
                        aria-hidden="true"
                      >
                        {$userFirstName}
                      </span>
                      <svg
                        class="ml-2 h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* <!--
              Dropdown menu, show/hide based on menu state.

              Entering: "transition ease-out duration-100"
                From: "transform opacity-0 scale-95"
                To: "transform opacity-100 scale-100"
              Leaving: "transition ease-in duration-75"
                From: "transform opacity-100 scale-100"
                To: "transform opacity-0 scale-95"
            --> */}
                  <div
                    ref={userMenuRef}
                    class="absolute right-0 z-10 mt-2.5 hidden w-32 origin-top-right scale-95 transform rounded-md bg-white py-2 opacity-0 shadow-lg ring-1 ring-gray-900/5 transition duration-100 ease-in-out focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabindex="-1"
                  >
                    {/* <!-- Active: "bg-gray-50", Not Active: "" --> */}
                    <a
                      href={import.meta.env.VITE_USER_PROFILE_URL}
                      class="block px-3 py-1 text-sm leading-6 text-gray-900"
                      role="menuitem"
                      tabindex="-1"
                      id="user-menu-item-0"
                    >
                      Your profile
                    </a>
                    <a
                      href="#"
                      onClick={async () => {
                        await signOut();
                        location.reload();
                      }}
                      class="block px-3 py-1 text-sm leading-6 text-gray-900"
                      role="menuitem"
                      tabindex="-1"
                      id="user-menu-item-1"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <main class="py-10">
            <div class="px-4 sm:px-6 lg:px-8">{router.outlet}</div>
          </main>
        </div>
      </div>
    </>
  );
}
