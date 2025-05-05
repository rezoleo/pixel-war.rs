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
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-xxl">
        <Link className="navbar-brand" to={links[0].href}>
          <img src='/logo_rezoleo.svg' alt="Logo" width={50} height={50} />
        </Link>

        {/* Add a button to toggle the navbar on small screens */}
        <BurgerMenu navbarId="navbarNav" />
        <div className="collapse navbar-collapse" id="navbarNav">
          <NavbarLinks links={links} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
