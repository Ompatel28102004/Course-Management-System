import React from "react";
import "./LandingPage.css";
import { assets } from "../../assets/assets.js";
import Button from "../Button/Button.jsx";
import LandingPageNavbar from "../LandingPageNavbar/LandingPageNavbar.jsx";

export default function LandingPage() {

  return (
    <>
      {/* Main Container */}
      <div className="mainContainer">
        
        {/* Navbar */}
        <LandingPageNavbar/>

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
              <img  src={assets.study_desk} alt="study_desk" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
