// @ts-nocheck
'use client';

import { socials } from '../../constants';
import { SiHiveBlockchain } from 'react-icons/si';

const Footer = () => (
  <>
    <div className="footer-gradient" />
    <div className="mx-[60px] flex flex-col gap-8 py-10">
      <div className="flex flex-col">
        <div className="mb-[50px] h-[2px] bg-white opacity-10" />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <h4 className="font-extrabold text-[24px] text-white">Artemis</h4>
          <p className="font-normal text-[14px] text-white opacity-50">
            Copyright © 2024 Artemis. All rights reserved.
          </p>

          <div className="flex gap-4">
            {socials.map((social) => (
              <img
                key={social.name}
                src={social.url}
                alt={social.name}
                className="w-[24px] h-[24px] object-contain cursor-pointer"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Footer;
