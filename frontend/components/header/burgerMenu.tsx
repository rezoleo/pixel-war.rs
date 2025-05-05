"use client";

import React from "react";

interface BurgerMenuProps {
  navbarId: string;
}

const BurgerMenu: React.FC<BurgerMenuProps> = ({ navbarId }) => {
  return (
    <button
      className="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target={`#${navbarId}`}
      aria-controls={navbarId}
      aria-expanded='false'
      aria-label="Toggle navigation"
    >
      <span className="navbar-toggler-icon"></span>
    </button>
  );
};

export default BurgerMenu;
