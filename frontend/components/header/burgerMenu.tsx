"use client";

import React, { useState } from "react";

interface BurgerMenuProps {
  navbarId: string;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ navbarId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <button
      className="md:hidden text-white focus:outline-none"
      onClick={toggleMenu}
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon block w-6 h-0.5 bg-white mb-1"></span>
      <span className="navbar-toggler-icon block w-6 h-0.5 bg-white mb-1"></span>
      <span className="navbar-toggler-icon block w-6 h-0.5 bg-white"></span>
    </button>
  );
};

export default BurgerMenu;
