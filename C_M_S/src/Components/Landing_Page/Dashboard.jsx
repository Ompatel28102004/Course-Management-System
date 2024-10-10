import React from "react";
import "./Dashboard.css";
import { assets } from "../../assets/assets";
import Button from "../Button/Button.jsx";
import { useState } from "react";
import { FaBars } from 'react-icons/fa'
import { NavLink } from "react-router-dom";

export default function Dashboard() {

  const [isOpen,setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  }

  return (
    <>
      {/* Main Container */}
      <div className="mainContainer">
        
        {/* Navbar */}
        <nav 
        style={{color:"#B21FDC"}}
        className="max-w-screen rounded-md bg-white justify-evenly py-3 text-[25px] font-semibold outline-none">
          <div className="sm:flex justify-evenly hidden">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "outline-none" : "outline-none text-black"
              }
            >
              Study Sync
            </NavLink>

            <NavLink
              is
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
              is
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
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? "outline-none" :"text-black"}
            >
             Study Sync
            </NavLink>
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
              to="/aboutus"
              className={({ isActive }) =>
                isActive ? "outline-none" : "text-black outline-none"
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/contactus"
              className={({ isActive }) =>
                isActive ? "outline-none" : "text-black outline-none"
              }
            >
              Contact Us
            </NavLink>
          </div>
        </nav>  

        {/* Intro Container */}
        <div className="introContainer">
          <div className="introLeftDiv">
            <div className="textDiv">
              <h1 className="heading">
                {" "}
                Connecting Educators and Learners with Ease
              </h1>
            </div>
            <p className="description">
              {" "}
              Our platform streamlines course management, making it effortless
              for educators to teach and students to learn. Experience seamleass
              interaction and enhanced learning with intuitive tools designed
              for success.
            </p>
            <div className="imgDivLeft">
              <img src={assets.study_desk} alt="study_desk" />
            </div>
            <div className="btns">
              <div className="quoteDiv">
                <span className="material-symbols-outlined openQuote">
                  format_quote
                </span>
                <p>Let's Dive into Knowledge</p>
                <span className="material-symbols-outlined">format_quote</span>
              </div>
              <Button
                children={"Get Started"}
                clsName={"getStartedBtn"}
              />
            </div>
            <div className="avatarContainer">
              <div className="avtarDiv">
                <div className="avatar">
                  <img src={assets.avatar_1} alt="human_profile_icon" />
                </div>
                <div className="avatar">
                  <img src={assets.avatar_2} alt="human_profile_icon" />
                </div>
                <div className="avatar">
                  <img src={assets.avatar_3} alt="human_profile_icon" />
                </div>
                <div className="avatar">
                  <img src={assets.avatar_4} alt="human_profile_icon" />
                </div>
              </div>
              <span className="text">Loved By Many!</span>
            </div>
          </div>

          {/* Intro Container Image */}
          <div className="introRightDiv">
            <div className="imgDiv">
              <img src={assets.study_desk} alt="study_desk" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
