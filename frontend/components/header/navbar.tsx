import React from "react";
import NavbarLinks from "./navbarLinks";
import { Link } from "react-router-dom";

const links = [
  { href: "/", label: "Home" },
  { href: "/pixelwar", label: "Pixel War" },
  { href: "/spectate", label: "Spectate" },
  { href: "/admin", label: "Admin" },
];

const Navbar: React.FC = () => {
  return (
    <nav className="bg-linear-to-r px-3 from-rose-900 to-red-950 text-white shadow-md">
      <div className="container mx-auto flex py-5">
        <Link className="sm:mr-10 mr-5 items-center" to={links[0].href}>
          <img src="/logo_rezoleo_blanc.svg" alt="Logo" className="w-18 h-18" />
        </Link>

        <NavbarLinks links={links} />
      </div>
    </nav>
  );
};

export default Navbar;
