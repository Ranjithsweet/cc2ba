import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-200 text-center py-4 mt-10">
      <p>&copy; {new Date().getFullYear()} MyCompany. All rights reserved.</p>
    </footer>
  );
}

export default Footer;
