/* eslint-disable */
'use client';
import { useRouter, usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import Links from './components/Links';
import Logo from './components/Logo';
import SidebarCard from 'components/sidebar/components/SidebarCard';
import {
  renderThumb,
  renderTrack,
  renderView,
} from 'components/scrollbar/Scrollbar';
import { Scrollbars } from 'react-custom-scrollbars-2';
import avatar4 from '/public/img/avatars/avatar4.png';
import routes from 'routes';
import Card from 'components/card';
import Image from 'next/image';

function SidebarHorizon(props: {
  routes: any;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  variant?: string;
  onClose: () => void;
  mini?: boolean;
}) {
  const { open, onClose, variant, mini } = props;
  const [hovered, setHovered] = useState(false);

  const router = useRouter();

  // L  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname

  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    // Lấy tournamentId từ URL bằng window.location.pathname
    const currentPath = window.location.pathname;
    console.log('path ', currentPath); // Lấy đường dẫn hiện tại
    const pathParts = currentPath.split('/'); // Tách các phần của đường dẫn
    const extractedTournamentId = pathParts[3]; // tournamentId là phần thứ 4

    if (extractedTournamentId) {
      setTournamentId(extractedTournamentId); // Lưu tournamentId vào state
    } else {
      console.error('No tournamentId found in the URL');
    }
  }, []);

  return (
    <div
      className={`sm:none ${
        mini === false
          ? 'w-[285px]'
          : mini === true && hovered === true
          ? 'w-[285px]'
          : 'w-[285px] xl:!w-[285px]'
      } duration-175 linear fixed !z-50 min-h-full transition-all md:!z-50 lg:!z-50 xl:!z-0 ${
        variant === 'auth' ? 'xl:hidden' : 'xl:block'
      } ${open ? '' : '-translate-x-[105%] xl:translate-x-[unset]'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Card
        extra={`mr-3 w-full h-[96.5vh] sm:ml-4 sm:my-4 m-7 !rounded-[20px]`}
      >
        <Scrollbars
          autoHide
          renderTrackVertical={renderTrack}
          renderThumbVertical={renderThumb}
          renderView={renderView}
        >
          <div className="flex h-full flex-col justify-between">
            <div>
              <span
                className="absolute left-4 top-4 block cursor-pointer xl:hidden"
                onClick={onClose}
              >
                <HiX />
              </span>
              {/* logo */}
              <div className="mb-[15px] mt-[28px]">
                <div className="ml-5 flex">
                  <SidebarCard />
                </div>

                {/* <div className="mt-5 flex items-center justify-center gap-3">
                  <div className="relative h-12 w-12 rounded-full bg-blue-200">
                    <Image
                      fill
                      style={{ objectFit: 'contain' }}
                      src={avatar4}
                      className="rounded-full"
                      alt="avatar"
                    />
                  </div>
                  <div
                    className={`mr-1 ${
                      mini === false
                        ? 'block'
                        : mini === true && hovered === true
                        ? 'block'
                        : 'block xl:hidden'
                    }`}
                  ></div>
                </div> */}
              </div>
              {/* <div className={`ml-[5px] mt-[5px] flex items-center `}>
                <div
                  className={`mb-1 ml-5 mt-1 h-2.5 items-center font-poppins text-[26px] font-bold uppercase text-navy-700 dark:text-white ${
                    mini === false
                      ? 'hidden'
                      : mini === true && hovered === true
                      ? 'hidden'
                      : 'block'
                  }`}
                >
                 
                </div>
              </div> */}
              {/* lang ngang cach */}
              {/* <div className="mb-7 mt-[60px] h-px bg-gray-200 dark:bg-white/10" /> */}
              {/* Nav item */}
              <ul>
                <Links routes={routes} tournamentId={tournamentId} />
              </ul>
            </div>
          </div>
        </Scrollbars>
      </Card>
    </div>
  );
}

export default SidebarHorizon;
