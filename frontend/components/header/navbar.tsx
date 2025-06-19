import React, { useState, useEffect } from "react";
import NavbarLinks from "./navbarLinks";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const basicLinks = [
  { href: "/", label: "Home" },
  { href: "/pixelwar", label: "Pixel War" },
  { href: "/spectate", label: "Spectate" },
  { href: "/admin", label: "Admin" },
];

const Navbar: React.FC = () => {
  const [links, setLinks] = useState(basicLinks);

  useEffect(() => {
    axios
      .get("/api/me")
      .then((response) => {
        if (response.data.admin) {
          setLinks((prevLinks) => {
            // Only add if not already present
            if (!prevLinks.some((link) => link.href === "/admin-control")) {
              return [
                ...prevLinks,
                { href: "/admin-control", label: "Admin Control" },
              ];
            }
            return prevLinks;
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  const location = useLocation();

  if (location.pathname === "/spectate") {
    return null; // Hide navbar on spectate page
  }

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
