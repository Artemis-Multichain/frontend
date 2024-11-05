import React, { useState, useEffect } from 'react';
import { SiBlockchaindotcom } from 'react-icons/si';
import Link from 'next/link';

const Navbar = () => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const show = window.scrollY > 50;
      if (show) {
        setSticky(true);
      } else {
        setSticky(false);
      }
    };
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={
        sticky
          ? 'stick transition-all backdrop-filter backdrop-blur-lg bg-white bg-opacity-30 bg-transparent z-50'
          : ''
      }
    >
      <section className="container max-w-[64rem] mx-auto px-6 sticky">
        <div className="relative flex items-center justify-between h-24">
          <div className="flex items-center justify-between w-full">
            <Link
              className="flex items-center justify-center max-w-[121px] sm:max-w-[161px] px-1 sm:px-[5.33px] transition-all"
              href="/"
            >
              <div className="text-white text-[20px]">
                <SiBlockchaindotcom />
              </div>
              &nbsp;
              <p className="text-white text-[25px] font-bold">Artemis</p>
            </Link>

            <a
              target="_blank"
              href="/home"
              className="flex mr-[calc(24px+16px)] sm:mr-0 justify-center space-x-2 items-center bg-black text-white border-primer rounded-lg px-[1.5rem] text-base font-bold h-10 sm:h-12 min-w-[105px] sm:min-w-[140px] transition-all"
              rel="noreferrer"
            >
              <span>Get Started</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="hidden transition-all sm:block"
              >
                <path
                  d="M5.64297 3.75736L12.2426 3.75736M12.2426 3.75736L12.2426 10.357M12.2426 3.75736L3.75735 12.2426"
                  stroke="white"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </a>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center transition-all sm:hidden">
            <button
              className="min-[412px]:text-white min-[412px]:bg-[#101010]/[.3] min-[412px]:backdrop-blur-lg text-white rounded-sm w-6 h-6 inline-flex items-center justify-center rounded-mdx hover:bg-none focus:outline-none focus:ring-none focus:ring-none transition-all"
              id="headlessui-disclosure-button-:R15id6:"
              type="button"
              aria-expanded="false"
              data-headlessui-state=""
            >
              <span className="sr-only">Open main menu</span>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="2"
                  rx="1"
                  fill="currentColor"
                ></rect>
                <rect
                  x="2"
                  y="11"
                  width="20"
                  height="2"
                  rx="1"
                  fill="currentColor"
                ></rect>
                <rect
                  x="2"
                  y="18"
                  width="20"
                  height="2"
                  rx="1"
                  fill="currentColor"
                ></rect>
              </svg>
            </button>
          </div>
        </div>
      </section>
    </nav>
  );
};

export default Navbar;
