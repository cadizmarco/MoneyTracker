import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X, Menu } from 'lucide-react';

interface NavItem { path: string; label: string; icon?: any }

export default function MobileHamburger({ navItems, currentPath, navigate }: { navItems: NavItem[]; currentPath: string; navigate: (p: string) => void }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const openMenu = () => {
    setVisible(true);
    // allow next tick so CSS transition can play
    requestAnimationFrame(() => setOpen(true));
  };

  const closeMenu = () => {
    setOpen(false);
    // wait for transition duration then unmount
    setTimeout(() => setVisible(false), 220);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div />
        <button
          aria-label="Open menu"
          className="p-2 rounded-md border bg-white"
          onClick={openMenu}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {visible && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeMenu}
          />

          <div
            className={`absolute left-0 top-0 bottom-0 w-64 bg-white p-4 shadow-lg transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Menu</div>
              <button className="p-1 rounded" onClick={closeMenu}><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-2">.
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => { closeMenu(); navigate(item.path); }}
                  className={`w-full text-left px-3 py-2 rounded ${currentPath === item.path ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
      {/* Floating add button on mobile */}
      <div className="fixed right-4 bottom-6 md:hidden">
        <button
          onClick={() => navigate('/transactions?add=true')}
          className="bg-primary text-primary-foreground w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Add transaction"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}