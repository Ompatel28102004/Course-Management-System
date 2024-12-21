import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Btn({ children, clsName }) {

  const navigate = useNavigate();

  function handleClick(){

    if( clsName === "getStartedBtn" ){
      navigate("/login");
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
