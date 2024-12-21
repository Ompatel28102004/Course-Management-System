import React from 'react'
import { FaBars } from 'react-icons/fa'
import { NavLink } from "react-router-dom";
import { useState } from 'react';
import { assets } from "../../assets/assets";

export default function LandingPageNavbar() {

    const [isOpen,setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

  return (
    <>
    <nav 
        style={{color:"#B21FDC"}}
        className="max-w-screen rounded-md bg-white justify-evenly py-3 text-[25px] font-semibold outline-none">
          <div className="sm:flex justify-evenly hidden">

            <div className='flex justify-center items-center gap-3'>

              <img src={assets.main_icon} alt="study-sync-icon" className='w-[30px] h-[35px]' />
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "outline-none" : "outline-none text-black"
                }
              >
              Study Sync
              </NavLink>

            </div>

            <NavLink
              // is
              to="/about-us"
              className={({ isActive }) =>
                isActive
                  ? "outline-none sm:block hidden"
                  : "text-black outline-none sm:block hidden"
              }
            >
              About Us
            </NavLink>

            <NavLink
              // is
              to="/contact-us"
              className={({ isActive }) =>
                isActive
                  ? "outline-none sm:block hidden"
                  : "text-black outline-none sm:block hidden"
              }
            >
              Contact Us
            </NavLink>
          </div>

          <div className="sm:hidden flex justify-between items-center px-3">
            
            <div className='flex w-max gap-3'>
              <img src={assets.main_icon} alt="study-sync-icon" className='w-[30px] h-[35px]' />
              <NavLink
                to="/"
                className={({ isActive }) => isActive ? "outline-none" :"text-black"}
              >
              Study Sync
              </NavLink>
            </div>
            <button
              onClick={toggleMenu}
              className="text-white focus:outline-none"
            >
              <FaBars size={24} style={{color:"#B21FDC"}}/>
            </button>
          </div>

          <div
            style={{color:"#B21FDC"}}
            className={`sm:hidden flex flex-col space-y-4 mt-4 px-3 ${
              isOpen ? "block" : "hidden"
            }`}
          >
            <NavLink
              to="/about-us"
              className={({ isActive }) =>
                isActive ? "outline-none" : "text-black outline-none"
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact-us"
              className={({ isActive }) =>
                isActive ? "outline-none" : "text-black outline-none"
              }
            >
              Contact Us
            </NavLink>
          </div>
        </nav>   
    </>
  )
}

