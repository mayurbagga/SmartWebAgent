// Footer.tsx

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border mt-20 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-sm text-muted-foreground">
        <span>© 2025 - Gintonic</span>
        <a href="#" className="hover:text-foreground">Terms of use</a>
      </div>
    </footer>
  );
};

export default Footer;
