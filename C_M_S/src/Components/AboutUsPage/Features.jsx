import React from 'react'

export default function Features(props) {
  return (
    <>
    <div className='flex sm:flex-row flex-col gap-2 bg-white p-2 items-center shadow-md rounded-lg'>
        <img className='w-[65px]' src={props.path} />
        <div className='flex flex-col'>
            <h1 className='flex font-semibold text-xl justify-center sm:justify-start'>{props.heading}</h1>
            <p className='flex text-gray-700 text-[18px] text-center sm:text-left justify-center sm:justify-start'>{props.detail}</p>
        </div>
    </div>
    </>
  )
}