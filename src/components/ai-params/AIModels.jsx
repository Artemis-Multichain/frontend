import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useGenerationStore } from '@/store/useGenerationStore';

const styles_preset = [
  { name: 'Stable Image Ultra' },
  { name: 'Stable Image Core' },
  { name: 'Stable Diffusion XL' },
  { name: 'Waifu Diffusion' },
  { name: 'Dreamshaper V7' },
];

export default function AIModels() {
  const { selectedModel, setSelectedModel } = useGenerationStore();

  return (
    <div className="w-full bg-transparent z-10">
      <Listbox value={selectedModel} onChange={setSelectedModel}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default text-black border-gray-600 border-[1px] bg-transparent rounded-lg  py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate bg-transparent text-white font-bold">
              <span className="text-gray-400 py-4 font-medium">
                Finetuned models
              </span>
              <br />
              {selectedModel.name}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md border-[1px] border-gray-500 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {styles_preset.map((model, modelIdx) => (
                <Listbox.Option
                  key={modelIdx}
                  className={({ active }) =>
                    `relative select-none py-2 pl-10 pr-4 bg-black cursor-pointer ${
                      active ? 'bg-[#0b0f178e] text-gray-400' : 'text-white'
                    }`
                  }
                  value={model}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate  ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {model.name}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600 bg-transparent">
                          <CheckIcon
                            className="h-5 w-5 text-purple-600"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
