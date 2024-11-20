import React from "react";
import LandingPageNavbar from "../LandingPageNavbar/LandingPageNavbar";
import { assets } from "../../assets/assets";

export default function ContactUs() {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "72dc96b6-0149-4680-86e9-f73001308035");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    event.target.reset();
  };

  return (
    <div
      style={{ backgroundColor: "#eaeaea" }}
      className="max-w-screen h-max flex flex-col px-[30px] py-[20px]"
    >
      <LandingPageNavbar />

      <div className="h-max flex md:flex-row flex-col justify- items-center ">
        <div className="h-full md:w-[50%] w-[90%] flex flex-col items-center justify-center gap-4">
          <h1
            style={{ color: "#B21FDC" }}
            className="font-semibold text-3xl mt-5 md:mt-0"
          >
            {" "}
            Get In Touch{" "}
          </h1>
          <div className="flex gap-2 justify-center items-center">
            <h3 className="w-max font-semibold text-2xl">Send us a message </h3>
            <img className="w-[50px]" src={assets.msg_icon} alt="msg_icon" />
          </div>
          <p className="text-[18px] text-gray-700 text-center">
            Feel free to reach out through contact form or find our contact
            information below. Your feedback, questions, and suggestions are
            important to us as we strive to provide exceptional service to our
            university community.
          </p>
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2">
              <img
                className="w-[40px]"
                src={assets.email_icon}
                alt="mail_icon"
              />
              <p className="text-normal text-gray-800 text-[18px]">
                studysync.cms@gmail.com
              </p>
            </div>
            <div className="flex items-center gap-2">
              <img
                className="w-[40px]"
                src={assets.contact_icon}
                alt="phone_icon"
              />
              <p className="text-normal text-gray-800 text-[18px]">
                +91 987-957-0010
              </p>
            </div>
          </div>
        </div>

        <div className="h-full md:w-[50%] w-[90%] flex justify-center items-center mt-5 ">
          <form onSubmit={onSubmit} className="w-[85%] flex flex-col gap-3">
            <div className="flex flex-col gap-[5px]">
              <label className="font-semibold text-[18px]">Your Name</label>
              <input
                className="font-medium outline-none border-none p-[14px]"
                type="text"
                name="name"
                placeholder="Enter your name.."
                required
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="font-semibold text-[18px]">Phone Number</label>
              <input
                className="font-medium outline-none border-none p-[14px]"
                type="tel"
                name="phone"
                placeholder="Enter your mobile number.."
                required
              />
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="font-semibold text-[18px]">
                Write your message here
              </label>
              <textarea
                className="font-medium outline-none border-none p-[14px] resize-none"
                name="message"
                rows="6"
                placeholder="Enter your message.."
                required
              ></textarea>
            </div>
            <div className="bg-[#B21FDC] hover:bg-customHoverBg cursor-pointer w-[200px] mt-2 flex justify-center items-center text-white gap-2 p-3 rounded-lg self-center">
              <button
                type="submit"
                className="text-xl font-normal"
              >
                Submit Now
              </button>
              <img
                className="w-[15px]"
                src={assets.right_arrow}
                alt="arrow_icon"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="flex justify-center items-center flex-col gap-3 mt-2">
        <h1
          style={{ color: "#B21FDC" }}
          className="font-semibold text-3xl mt-5 md:mt-0 text-center"
        >
          Find us at our campus location
        </h1>
        <p className="text-normal text-gray-800 text-[18px] text-center">
          IITRAM college, opposite parishkar phase -1, near khokhra circle
          maninagar east Ahmedabad 380008{" "}
        </p>
        <div className="max-w-full w-[900px] flex justify-center mt-2">
          <iframe
            className="shadow-lg rounded-lg"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.534992100846!2d72.61905467492468!3d23.00412097918668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e86754818a631%3A0xba553baa74c5e165!2sInstitute%20of%20Infrastructure%2C%20Technology%2C%20Research%20and%20Management(IITRAM)!5e0!3m2!1sen!2sin!4v1728756250893!5m2!1sen!2sin"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map"
          ></iframe>
        </div>
      </div>

      <div className="w-full font-medium mt-5 border-t-2 border-gray-600 flex flex-col items-center md:flex-row md:justify-between text-gray-700">
        <p>@ 2024 Study Sync. All rights reserved.</p>
        <div className="flex gap-3">
          <p>Terms of services</p>
          <p>Privacy Policy </p>
        </div>
      </div>
    </div>
  );
}
