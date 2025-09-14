import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const getBreadcrumbItems = () => {
    const path = location?.pathname;
    const items = [];

    // Always start with Dashboard
    items?.push({ label: 'Dashboard', path: '/dashboard', isActive: false });

    switch (path) {
      case '/learning-roadmap':
        items?.push({ label: 'Learning Roadmap', path: '/learning-roadmap', isActive: true });
        break;
      case '/lesson-interface':
        items?.push({ label: 'Learning Roadmap', path: '/learning-roadmap', isActive: false });
        items?.push({ label: 'Lesson Interface', path: '/lesson-interface', isActive: true });
        break;
      case '/simulation-lab':
        items?.push({ label: 'Simulation Lab', path: '/simulation-lab', isActive: true });
        break;
      case '/dashboard':
        items[0].isActive = true;
        break;
      default:
        break;
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  // Don't show breadcrumbs on login/register pages or if only dashboard
  if (location?.pathname === '/login' || location?.pathname === '/register' || breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems?.map((item, index) => (
          <li key={item?.path} className="flex items-center space-x-2">
            {index > 0 && (
              <Icon name="ChevronRight" size={16} className="text-muted-foreground/60" />
            )}
            {item?.isActive ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item?.label}
              </span>
            ) : (
              <Link
                to={item?.path}
                className="hover:text-foreground transition-colors duration-150 hover:underline"
              >
                {item?.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;