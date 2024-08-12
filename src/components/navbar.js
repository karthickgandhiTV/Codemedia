import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Auth, Hub } from "aws-amplify";
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Navbar = () => {
  const [signedUser, setSignedUser] = useState(false);

  useEffect(() => {
    authListener();
  }, []);

  async function authListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signIn":
          return setSignedUser(true);
        case "signOut":
          return setSignedUser(false);
      }
    });
    try {
      await Auth.currentAuthenticatedUser();
      setSignedUser(true);
    } catch (err) {}
  }

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-black to-transparent">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-cyan-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Your Company"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    <Link legacyBehavior href="/">
                      <a className="text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                        Home
                      </a>
                    </Link>
                    <Link legacyBehavior href="/create-post">
                      <a className="text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                        Create Post
                      </a>
                    </Link>
                    <Link legacyBehavior href="/profile">
                      <a className="text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                        Profile
                      </a>
                    </Link>
                    {signedUser && (
                      <Link legacyBehavior href="/my-posts">
                        <a className="text-gray-300 hover:bg-cyan-600 hover:text-white rounded-md px-3 py-2 text-sm font-medium">
                          My Posts
                        </a>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link legacyBehavior href="/">
                <a className="text-gray-300 hover:bg-cyan-600 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                  Home
                </a>
              </Link>
              <Link legacyBehavior href="/create-post">
                <a className="text-gray-300 hover:bg-cyan-600 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                  Create Post
                </a>
              </Link>
              <Link legacyBehavior href="/profile">
                <a className="text-gray-300 hover:bg-cyan-600 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                  Profile
                </a>
              </Link>
              {signedUser && (
                <Link legacyBehavior href="/my-posts">
                  <a className="text-gray-300 hover:bg-cyan-600 hover:text-white block rounded-md px-3 py-2 text-base font-medium">
                    My Posts
                  </a>
                </Link>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
