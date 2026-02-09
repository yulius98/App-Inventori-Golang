import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function TopBar() {
  // Fungsi untuk handle sign out
  const handleSignOut = () => {
    localStorage.clear();
  };
  return (
    <Disclosure
      as="nav"
      className="bg-white dark:bg-gray-900 shadow-sm dark:shadow-none after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gray-200 dark:after:bg-white/10"
      style={{ position: 'fixed', top: 0, left: '200px', right: 0, zIndex: 1100, width: 'calc(100% - 200px)' }}
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            
            
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <button
              type="button"
              className="relative rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500"
            >
              <span className="absolute -inset-1.5" />
              <span className="sr-only">View notifications</span>
              <BellIcon aria-hidden="true" className="size-6" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800 dark:text-gray-200">
                  {/*-- Kotak utama --*/}
                  <rect x="3" y="7" width="18" height="13" rx="2" ry="2" fill="#f2f2f2" stroke="currentColor"/>
                  
                  {/*-- Tutup kotak --*/}
                  <path d="M3 7 L12 3 L21 7 Z" fill="#d9d9d9" stroke="currentColor"/>
                  
                  {/*-- Garis label --*/}
                  <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor"/>
                  <line x1="7" y1="16" x2="17" y2="16" stroke="currentColor"/>
                </svg>

              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg dark:shadow-none border border-gray-200 dark:border-transparent outline -outline-offset-1 outline-gray-200 dark:outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                
                <MenuItem>
                  <a
                    href="/login"
                    onClick={handleSignOut}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 data-focus:bg-gray-100 dark:data-focus:bg-white/5 data-focus:outline-hidden"
                  >
                    Sign out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

    </Disclosure>
  )
}
