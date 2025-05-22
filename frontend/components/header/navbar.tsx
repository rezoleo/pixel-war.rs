import React from "react";
import NavbarLinks from "./navbarLinks";
import BurgerMenu from "./burgerMenu";
import { Link } from "react-router-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/pixelwar", label: "Pixel War" },
  { href: "/spectate", label: "Spectate" },
  { href: "/admin", label: "Admin" },
];

const Navbar: React.FC = () => {
  return (
    <nav className="bg-linear-to-r from-rose-900 to-red-950 text-white shadow-md">
      <div className="container mx-auto flex">
        <Link className="mr-10 items-center py-5" to={links[0].href}>
          <img src="/logo_rezoleo_blanc.svg" alt="Logo" className="w-18 h-18" />
        </Link>

        {/* Burger menu for mobile */}
        <BurgerMenu navbarId="navbarNav" />

        <NavbarLinks links={links} />
      </div>
    </nav>
  );
};

export default Navbar;
