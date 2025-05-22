"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

interface NavbarLinksProps {
  links: {
    href: string;
    label: string;
  }[];
}

const NavbarLinks: React.FC<NavbarLinksProps> = ({ links }) => {
  const location = useLocation();
  return (
    <ul className="flex items-end space-x-6 pb-5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            className={clsx("text-white text-lg hover:text-gray-500", {
              "font-bold border-b-2 border-white":
                location.pathname === link.href,
            })}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NavbarLinks;
