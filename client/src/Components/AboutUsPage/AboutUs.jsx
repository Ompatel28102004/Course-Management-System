import React from 'react'
import './AboutUs.css'
import LandingPageNavbar from '../LandingPageNavbar/LandingPageNavbar'
import Features from './Features'
import { assets } from '../../assets/assets'
import DeveloperCard from './DeveloperCard'
import { useNavigate } from 'react-router-dom'

export default function AboutUs() {

  const navigate  = useNavigate();

  return (
    <>
    <div style={{backgroundColor:"#eaeaea"}} className='max-w-screen h-max flex flex-col px-[30px] py-[20px]'>
        <LandingPageNavbar/>
        <div className='hero container h-[calc(100vh-60px)] mt-4' id='home'>
          <div className='heroText'>
            <h1>We Ensure better education for a better world</h1>
            <p>Our cutting-edge curriculum is designed to empower students with the knowledge, skills, and expriences needed to excel in the dynamic field of education</p>       
          </div>
        </div>

        <div className='w-full flex flex-col justify-center items-center mt-4  gap-[35px]'>

          <div className='flex flex-col justify-center items-center gap-2'>
            <h1 style={{color:"#B21FDC"}} className='font-semibold text-3xl'> Introduction </h1>
            <p className='w-[80%] text-center text-wrap text-gray-700 font-medium text-[19px]'>Our Course Management System (CMS) is designed to streamline the educational experience for both students and educators. From organizing course materials to managing assignments and assessments, our platform enhances collaboration and simplifies academic processes.</p>
          </div>

          <div className='flex flex-col justify-center items-center gap-2'>
            <h1 style={{color:"#B21FDC"}} className='font-semibold text-3xl'> Our Mission </h1>
            <p className='w-[80%] text-center text-wrap text-gray-700 font-medium text-[19px]'>Our mission is to provide a user-friendly, accessible, and comprehensive platform that bridges the gap between educators and students, fostering a better learning environment.</p>
          </div>

          <div className='flex flex-col justify-center items-center gap-3'>
              <h1 style={{color:"#B21FDC"}} className='font-semibold text-3xl'> Features </h1>
              <div className='flex flex-col gap-4'>
                <Features path={assets.cr_icon} detail="Easily enroll in courses and view schedules." heading="Course Registration" />
                <Features path={assets.oe_icon} detail="Conduct and manage exams online with secure, time-bound assessments." heading="Online Examination" />
                <Features path={assets.gs_icon} detail="Access grades and performance reports in one place." heading="Grading System" />
                <Features path={assets.df_icon} detail="Engage in discussions with peers and instructors." heading="Discussion Forum" />
                <Features path={assets.as_icon} detail="Submit and track assignments with real-time feedback." heading="Assignment Submission" />
                <Features path={assets.at_icon} detail="Track student attendance seamlessly with automated records and real-time updates." heading="Attendence" />
              </div>
          </div>

          <div className='flex flex-col justify-center items-center gap-4'>
            <h1 style={{color:"#B21FDC"}} className='font-semibold text-3xl'>Founder/Developer</h1>
            <div className='flex flex-wrap justify-center gap-3'>
                <DeveloperCard path={assets.m_alpha} name="Man Patel" info="Frontend Developer" iL="" gL="https://github.com/manMp07" lL="https://www.linkedin.com/in/man-patel-543661249/"/>
                <DeveloperCard path={assets.a_alpha} name="Ayaan Himani" info="MERN Stack Developer" iL="https://www.instagram.com/ayaanhimani/" gL="https://github.com/AyaanHimani" lL="https://www.linkedin.com/in/ayaan-himani-1a4923287/"/>
                <DeveloperCard path={assets.j_alpha} name="Jayesh Belsare" info="MERN Satck Developer" iL="" gL="https://github.com/Curious-nova" lL="https://www.linkedin.com/in/jayeshbelsare/"/>
                <DeveloperCard path={assets.o_alpha} name="Om Patel" info="MERN Satck Developer" iL="https://www.instagram.com/ompatel0329/" gL="https://github.com/Ompatel28102004" lL="https://www.linkedin.com/in/om-patel-36aa25257/"/>
                <DeveloperCard path={assets.r_alpha} name="Rohit Pani" info="Web Designer" iL="https://www.instagram.com/rohit.pani.16/" gL="https://github.com/R1N1X" lL="https://www.linkedin.com/in/rohit-pani-036083283/"/>
                <DeveloperCard path={assets.n_alpha} name="Namra Patel" info="Backend Developer" iL="https://www.instagram.com/victorkrait0103/" gL="https://github.com/Coding1610" lL="https://www.linkedin.com/in/namra-patel-19967922b/"/>
            </div>
          </div>

          <p className='text-gray-700 text-[18px] text-center'>"Interested in learning more? <span onClick={(e) => navigate('/contact-us')} className='text-black font-semibold cursor-pointer'>Contact us</span> or <span onClick={(e) => navigate('/Login')} className='text-black font-semibold cursor-pointer'>Sign up</span> today to experience the future of education management."</p>

        </div>

    </div>
    </>
  )
}