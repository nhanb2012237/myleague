// layouts/TournamentsLayout.tsx
import React, { ReactNode } from 'react';
import authImg from '/public/img/auth/auth.png';
import background from '/public/img/auth/background.jpg';
import NavLink from 'components/link/NavLink';
import Footer from 'components/footer/FooterAuthDefault';

interface TournamentsLayoutProps {
  maincard: ReactNode;
}

const TournamentsLayout: React.FC<TournamentsLayoutProps> = ({ maincard }) => {
  return (
    <div
      style={{ backgroundImage: `url(${background.src})` }}
      className="background relative flex min-h-screen w-full bg-cover bg-center bg-no-repeat "
    >
      <div className="mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:h-screen lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]">
        <div className="mb-auto flex flex-col pl-5 pr-5 md:pl-12 md:pr-0 lg:max-w-[48%] lg:pl-0 xl:max-w-full">
          {maincard}
          <div className="absolute right-0 hidden h-full min-h-screen md:block lg:w-[49vw] 2xl:w-[44vw]">
            <div
              className={`absolute flex h-full w-full items-center justify-center`}
            >
              <div className="relative flex">
                <div
                  style={{ backgroundImage: `url(${authImg.src})` }}
                  className="flex h-[420px] w-[500px] bg-cover"
                />
              </div>
            </div>
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default TournamentsLayout;
