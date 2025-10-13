'use client';

import { 
  Disclosure, 
  DisclosureButton, 
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems 
} from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';



interface NavigationItem {
  name: string;
  href: string;
  current: boolean;
  children?: Array<{
    name: string;
    href: string;
  }>;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href:'/', current: false},
  { 
    name: 'Stock', 
    href: '/stock', 
    current: false,
    children: [
      { name: 'Pembelian', href: '/stock/pembelian' },
      { name: 'Penjualan', href: '/stock/penjualan' },
    ],
  },
  { name: 'Category', href: '/category', current: false },
  { name: 'Product', href: '/produk', current: false },
  
];

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();

  // Update current state based on pathname
  const updatedNavigation = navigation.map(item => {
    const childMatch = item.children?.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
    return {
      ...item,
      current: pathname === item.href || !!childMatch || pathname.startsWith(item.href + '/') && !!item.children,
    };
  });

  return (
    <Disclosure as="nav" className="sticky top-0 z-50 bg-blue-600 backdrop-blur-md shadow-[0_0_10px_white] border-b border-purple-900/20">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon 
                aria-hidden="true" 
                className="block size-6 group-data-[open]:hidden" 
              />
              <XMarkIcon 
                aria-hidden="true" 
                className="hidden size-6 group-data-[open]:block" 
              />
            </DisclosureButton>
          </div>

          {/* Logo and Desktop Navigation */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            {/* Logo */}
            {/*<div className="flex shrink-0 items-center">
              <Link href="/" className="group">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                  <span className="text-blue-600 font-bold text-sm">IV</span>
                </div>
              </Link>
            </div> */}

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {updatedNavigation.map((item) => (
                  item.children && item.children.length > 0 ? (
                    <Menu as="div" className="relative inline-block text-left" key={item.name}>
                      <div>
                        <MenuButton
                          className={classNames(
                            item.current 
                              ? 'bg-blue-600 text-white shadow-[0_0_15px_white]'
                              : 'text-white hover:bg-blue-600 hover:text-white',
                            'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium border border-transparent hover:border-white hover:shadow-[0_0_10px_white] transition-all duration-300'
                          )}
                        >
                          {item.name}
                          <ChevronDownIcon className="size-4" aria-hidden="true" />
                        </MenuButton>
                      </div>
                      <MenuItems
                        transition
                        className="absolute left-0 mt-2 w-44 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 transition duration-100 ease-out"
                      >
                        <div className="py-1">
                          {item.children?.map((child) => (
                            <MenuItem key={child.name}>
                              {({ active }) => (
                                <Link
                                  href={child.href}
                                  className={classNames(
                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                    pathname === child.href ? 'font-semibold' : '',
                                    'block px-4 py-2 text-sm'
                                  )}
                                >
                                  {child.name}
                                </Link>
                              )}
                            </MenuItem>
                          ))}
                        </div>
                      </MenuItems>
                    </Menu>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      aria-current={item.current ? 'page' : undefined}
                      className={classNames(
                        item.current 
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_white]' 
                          : 'text-white hover:bg-blue-600 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium border border-transparent hover:border-white hover:shadow-[0_0_10px_white] transition-all duration-300'
                      )}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-2">
            <Link 
              href="/register" 
              className="rounded-md px-3 py-2 text-sm font-medium text-white  hover:border-white hover:shadow-[0_0_10px_white] hover:bg-purple-900/20 transition-all duration-300"
            >
              Register
            </Link>
            <Link 
              href="/login" 
              className="rounded-md px-3 py-2 text-sm font-medium text-white  hover:border-white hover:shadow-[0_0_10px_white] hover:bg-purple-900/20 transition-all duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      <DisclosurePanel className="sm:hidden bg-black/95 backdrop-blur-md border-t border-purple-900/20">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {updatedNavigation.map((item) => (
            item.children && item.children.length > 0 ? (
              <Disclosure key={item.name} as="div" className="space-y-1">
                {({ open }) => (
                  <>
                    <DisclosureButton
                      className={classNames(
                        item.current 
                          ? 'bg-gray-900 text-white shadow-[0_0_15px_white]'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white',
                        'flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-medium transition-all duration-300'
                      )}
                    >
                      <span>{item.name}</span>
                      <ChevronDownIcon
                        className={classNames(open ? 'rotate-180 transform' : '', 'size-4')}
                        aria-hidden="true"
                      />
                    </DisclosureButton>
                    <DisclosurePanel className="space-y-1 pl-4">
                      {item.children?.map((child) => (
                        <DisclosureButton
                          as={Link}
                          key={child.name}
                          href={child.href}
                          className={classNames(
                            pathname === child.href
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-300 hover:bg-white/5 hover:text-white',
                            'block rounded-md px-3 py-2 text-base font-medium transition-all duration-300'
                          )}
                        >
                          {child.name}
                        </DisclosureButton>
                      ))}
                    </DisclosurePanel>
                  </>
                )}
              </Disclosure>
            ) : (
              <DisclosureButton
                key={item.name}
                as={Link}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
                className={classNames(
                  item.current 
                    ? 'bg-gray-900 text-white shadow-[0_0_15px_white]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium transition-all duration-300'
                )}
              >
                {item.name}
              </DisclosureButton>
            )
          ))}
          
          {/* Mobile Register and Login */}
          <div className="border-t border-purple-900/20 pt-2 space-y-2">
            <DisclosureButton
              as={Link}
              href="/register"
              className="block rounded-md px-3 py-2 text-base font-medium text-white border border-purple-500 hover:border-white hover:shadow-[0_0_10px_white] hover:bg-purple-900/20 transition-all duration-300"
            >
              Register
            </DisclosureButton>
            <button 
              className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 cursor-not-allowed"
              disabled
            >
              Login (Coming Soon)
            </button>
          </div>
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}