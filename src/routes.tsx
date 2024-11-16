import React from 'react';
import { GiTrophyCup } from 'react-icons/gi';
import { IoSettingsOutline } from 'react-icons/io5';

// Admin Imports

// Icon Imports
import {
  MdHome,
  MdOutlineShoppingCart,
  MdBarChart,
  MdPerson,
  MdLock,
} from 'react-icons/md';

import { TbTournament } from 'react-icons/tb';
import { FaUsers } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';

const routes = [
  {
    name: 'Giải đấu',
    layout: '/admin',
    path: 'tournament/:tournamentId',
    icon: <GiTrophyCup className="h-6 w-6" />,

    secondary: true,
  },
  // {
  //   name: 'Rankings',
  //   layout: '/admin',
  //   icon: <MdBarChart className="h-6 w-6" />,
  //   path: 'rankings',
  // },
  {
    name: 'Bảng xếp hạng',
    layout: '/admin',
    icon: <MdBarChart className="h-6 w-6" />,
    path: 'tournament/:tournamentId/rankings',
  },

  {
    name: 'Cầu thủ',
    layout: '/admin',
    path: 'tournament/:tournamentId/players',
    icon: <MdPerson className="h-6 w-6" />,
  },
  // {
  //   name: 'tournament',
  //   layout: '/admin',
  //   path: 'tournament',
  //   icon: <TbTournament className="h-6 w-6" />,
  // },
  {
    name: 'Đội bóng',
    layout: '/admin',
    path: 'tournament/:tournamentId/team',
    icon: <FaUsers className="h-6 w-6" />,
  },
  {
    name: 'Tổng hợp',
    layout: '/admin',
    path: 'tournament/:tournamentId/default',
    icon: <MdDashboard className="h-6 w-6" />,
  },

  {
    name: 'Nhận diện cầu thủ',
    layout: '/admin',
    path: 'tournament/:tournamentId/FaceRecognitionWebCam',
    icon: <MdLock className="h-6 w-6" />,
  },
  {
    name: 'Thông tin giải đấu',
    layout: '/admin',
    path: 'tournament/:tournamentId/tournamentdetail',
    icon: <IoSettingsOutline className="h-6 w-6" />,
  },

  // {
  //   name: '',
  //   layout: '/admin',
  //   path: 'team/:teamId',
  // },

  // {
  //   name: 'sign-in',
  //   layout: '/auth',
  //   path: 'sign-in',
  //   icon: <MdLock className="h-6 w-6" />,
  // },
  // {
  //   name: 'sign-up',
  //   layout: '/auth',
  //   path: 'sign-up',
  //   icon: <MdLock className="h-6 w-6" />,
  // },
];
export default routes;
