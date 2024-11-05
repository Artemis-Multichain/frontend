import React from 'react';
import { Switch } from '@headlessui/react';

interface SwitchButtonProps {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export default function SwitchButton({
  enabled,
  setEnabled,
}: SwitchButtonProps) {
  return (
    <div className="pt-3 pb-2">
      <Switch
        checked={enabled}
        onChange={setEnabled}
        className={`${
          enabled
            ? 'bg-gradient-to-r from-indigo-500 to-pink-500'
            : 'bg-white/40'
        } relative inline-flex h-[30px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${enabled ? 'translate-x-9' : 'translate-x-0'}
            pointer-events-none inline-block h-[28px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
}
