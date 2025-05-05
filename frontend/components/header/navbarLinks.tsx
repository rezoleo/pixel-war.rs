"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from 'clsx';

interface NavbarLinksProps {
  links: {
    href: string;
    label: string;
  }[];
}

const NavbarLinks: React.FC<NavbarLinksProps> = ({ links }) => {
  const location = useLocation();
  return (
    <ul className="navbar-nav">
      {links.map((link) => (
        <li className="nav-item" key={link.href}>
          <Link
            to={link.href}
            className={clsx("nav-link", { active: location.pathname === link.href })}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavbarLinks;
