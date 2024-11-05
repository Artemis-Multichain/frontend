import React from 'react';

const SearchSubmission = () => {
  return (
    <div className="bg-transparent w-full px-[20px]">
      <form className="pt-2 px-[10px] bg-transparent">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className=" inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
          <input
            type="search"
            id="default-search"
            className="block w-full h-[40px] p-2 pl-10 text-sm text-gray-300 border border-gray-600 rounded-xl bg-black/60 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Submissions..."
            required
          />
          <div>
            <button
              type="submit"
              className="text-white absolute right-[2px] top-[2px] h-[40px]  bg-primer font-bold hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-sm px-8 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mb-6"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchSubmission;
