import React from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets';
import { NavLink } from 'react-router-dom';


export default function DeveloperCard(props){

    const navigate = useNavigate();

    return (
    <>
    <div className="w-[230px] flex flex-col justify-center gap-2 px-3 py-4 rounded-xl bg-slate-800 items-center">
        <div>
	        <img src={props.path} className="w-24 h-24" />
        </div>
	    <div className="text-center flex flex-col gap-2">
		    <div className="flex flex-col justify-center items-center">
			    <h2 className="text-white text-xl font-semibold">{props.name}</h2>
			    <p className="text-gray-400">{props.info}</p>
		    </div>
		    <div className="flex justify-center gap-3">
                <NavLink to={props.iL} target='_blank'>
			        <img className='w-[20px] cursor-pointer' src={assets.instagram} alt="instagram_icon" />
                </NavLink>
                <NavLink to={props.gL} target='_blank'>
                    <img className='w-[20px] cursor-pointer' src={assets.github} alt="github_icon" />
                </NavLink>
                <NavLink to={props.lL} target='_blank'>
                    <img className='w-[20px] cursor-pointer' src={assets.linkedin} alt="linked_icon" />
                </NavLink>
		    </div>
	    </div>
    </div>
    </>
  )
}