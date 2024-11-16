import { usePathname } from 'next/navigation';
import NavLink from 'components/link/NavLink';
import DashIcon from 'components/icons/DashIcon';

interface Route {
  name: string;
  layout: string;
  path: string;
  icon?: JSX.Element;
  secondary?: boolean;
}

interface LinksProps {
  routes: Route[];
  tournamentId?: string;
}

const Links = ({ routes, tournamentId }: LinksProps): JSX.Element => {
  const pathname = usePathname();

  // Hàm kiểm tra xem route có đang hoạt động không
  const activeRoute = (routePath: string) => {
    // Bỏ qua hai phần đầu tiên của đường dẫn
    const adjustedPathname = pathname.split('/').slice(3).join('/');
    const adjustedRoutePath = routePath.split('/').slice(3).join('/');

    // Kiểm tra xem đường dẫn hiện tại có khớp chính xác với đường dẫn của route
    return adjustedPathname === adjustedRoutePath;
  };

  // Tạo các liên kết dựa trên routes và tournamentId
  const createLinks = (routes: Route[]) => {
    return routes.map((route, index) => {
      // Thay thế các đoạn động bằng giá trị thực tế
      let routePath = route.path;
      if (routePath.includes(':tournamentId') && tournamentId) {
        routePath = routePath.replace(':tournamentId', tournamentId);
      }

      const fullPath = `${route.layout}/${routePath}`;

      return (
        <NavLink key={index} href={fullPath}>
          <div className="relative mb-3 flex hover:cursor-pointer">
            <li
              className="my-[3px] flex cursor-pointer items-center px-8"
              key={index}
            >
              <span
                className={`${
                  activeRoute(fullPath)
                    ? 'font-bold text-brand-500 dark:text-white'
                    : 'font-medium text-gray-600'
                }`}
              >
                {route.icon ? route.icon : <DashIcon />}
              </span>
              <p
                className={`leading-1 ml-4 flex ${
                  activeRoute(fullPath)
                    ? 'font-bold text-navy-700 dark:text-white'
                    : 'font-medium text-gray-600'
                }`}
              >
                {route.name}
              </p>
            </li>
            {activeRoute(fullPath) ? (
              <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-brand-500 dark:bg-brand-400" />
            ) : null}
          </div>
        </NavLink>
      );
    });
  };

  return <>{createLinks(routes)}</>;
};

export default Links;
