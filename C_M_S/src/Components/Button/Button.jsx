import React from 'react';
import { motion } from 'framer-motion';
import Login from '../Login_Page/Login';
import { useNavigate } from 'react-router-dom';

export default function Btn({ children, clsName }) {

  const navigate = useNavigate();

  function handleClick(){

    if( clsName === "getStartedBtn" ){
      navigate("/Login");
    }
    else{
      console.log("Invalid Path");
    }

  }

  return (
    <>
      <motion.button
        className={clsName}
        whileTap={{ scale: 0.95 }}  // Animation effect
        onClick={handleClick}
      >
        {children}
      </motion.button>
    </>
  );
}
