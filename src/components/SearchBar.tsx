import React from 'react';

const SearchBar = () => {
  return (
    <div className="bg-transparent w-[500px] mr-[240px] absolute top-[4px] left-[5px]">
      <form className="pt-2 px-[10px] bg-transparent">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className=" inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {/* <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg> */}
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border-[1px] border-gray-600 rounded-xl bg-transparent focus:ring-gray-600 focus:border-gray-600"
            placeholder="Search AI Images..."
            required
          />
          <div>
            <button
              type="submit"
              className="text-white absolute right-[1px] bottom-[1px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow text-white font-bold hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg text-sm px-4 py-2  dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
