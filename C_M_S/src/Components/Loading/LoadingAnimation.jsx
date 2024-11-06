import React from 'react';
import Lottie from 'react-lottie';
import animationData from '../../assets/animation.json';

const LoadingAnimation = () => {
  const animationDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <Lottie isClickToPauseDisabled={true} height={200} width={200} options={animationDefaultOptions} />
    </div>
  );
};

export default LoadingAnimation;
