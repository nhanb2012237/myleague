// trang để lấy tên trang hiện tại

import { IRoute } from 'types/navigation';
import Router from 'next/router';

export const isWindowAvailable = () => typeof window !== 'undefined';

const findCurrentRoute = (
  routes: IRoute[],
  pathname: string,
): IRoute | undefined => {
  return routes.find((route) => {
    const routePath = `${route.layout}/${route.path}`;
    return routePath === pathname;
  });
};

const getLastMeaningfulSegment = (pathname: string): string => {
  const meaningfulSegments: { [key: string]: string } = {
    team: 'Đội bóng',
    players: 'Cầu thủ',
    ranking: 'Xếp hạng',
    tournament: 'Giải đấu',
    rankings: 'Bảng xếp hạng',
    default: 'Thống kê',
    FaceRecognitionWebCam: 'Nhận diện khuôn mặt',
  };

  const pathSegments = pathname.split('/');
  for (let i = pathSegments.length - 1; i >= 0; i--) {
    if (meaningfulSegments[pathSegments[i]]) {
      return meaningfulSegments[pathSegments[i]];
    }
  }
  return 'Main Dashboard';
};

export const getActiveRoute = (routes: IRoute[], pathname: string): string => {
  const route = findCurrentRoute(routes, pathname);
  if (route) {
    return route.name;
  }
  // Nếu không tìm thấy route, lấy phần tử có nghĩa cuối cùng của pathname
  return getLastMeaningfulSegment(pathname);
};

export const getActiveNavbar = (
  routes: IRoute[],
  pathname: string,
): boolean => {
  const route = findCurrentRoute(routes, pathname);
  return route?.secondary || false;
};

export const getActiveNavbarText = (
  routes: IRoute[],
  pathname: string,
): string | boolean => {
  return getActiveRoute(routes, pathname) || false;
};
