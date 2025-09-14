import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
    { label: 'Learn', path: '/learning-roadmap', icon: 'BookOpen' },
    { label: 'Lab', path: '/simulation-lab', icon: 'FlaskConical' }
  ];

  const isActivePath = (path) => {
    if (path === '/dashboard') return location?.pathname === '/dashboard';
    if (path === '/learning-roadmap') return location?.pathname === '/learning-roadmap' || location?.pathname === '/lesson-interface';
    if (path === '/simulation-lab') return location?.pathname === '/simulation-lab';
    return false;
  };

  const userProgress = {
    xp: 2450,
    streak: 7,
    level: 12
  };

  return (
    <header className="sticky top-0 z-100 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-150">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="Zap" size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-semibold text-foreground">EngineerMaster</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-102 ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Progress Indicator - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 px-4 py-2 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="Zap" size={16} color="var(--color-accent)" />
              <span className="text-sm font-medium text-foreground">{userProgress?.xp?.toLocaleString()} XP</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center space-x-2">
              <Icon name="Flame" size={16} color="var(--color-warning)" />
              <span className="text-sm font-medium text-foreground">{userProgress?.streak} day streak</span>
            </div>
            <div className="w-px h-4 bg-border"></div>
            <div className="flex items-center space-x-2">
              <Icon name="Trophy" size={16} color="var(--color-primary)" />
              <span className="text-sm font-medium text-foreground">Level {userProgress?.level}</span>
            </div>
          </div>

          {/* Progress Indicator - Mobile */}
          <div className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <Icon name="Zap" size={16} color="var(--color-accent)" />
            <span className="text-sm font-medium text-foreground">{userProgress?.xp?.toLocaleString()}</span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Icon name="User" size={20} />
            </Button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-lg shadow-md animate-fade-in z-200">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} color="white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Alex Chen</p>
                      <p className="text-sm text-muted-foreground">Level {userProgress?.level} Engineer</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Icon name="User" size={18} />
                    <span className="text-sm text-foreground">Profile</span>
                  </Link>
                  
                  <Link
                    to="/achievements"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Icon name="Award" size={18} />
                    <span className="text-sm text-foreground">Achievements</span>
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Icon name="Settings" size={18} />
                    <span className="text-sm text-foreground">Settings</span>
                  </Link>
                  
                  <div className="border-t border-border my-2"></div>
                  
                  <button
                    className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-150 w-full text-left"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      // Handle logout
                    }}
                  >
                    <Icon name="LogOut" size={18} />
                    <span className="text-sm text-foreground">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              // Handle mobile menu toggle
            }}
          >
            <Icon name="Menu" size={24} />
          </Button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-100">
        <nav className="flex items-center justify-around py-2">
          {navigationItems?.map((item) => (
            <Link
              key={item?.path}
              to={item?.path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-150 ${
                isActivePath(item?.path)
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={item?.icon} size={20} />
              <span className="text-xs font-medium">{item?.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      {/* Overlay for mobile user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-150"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;