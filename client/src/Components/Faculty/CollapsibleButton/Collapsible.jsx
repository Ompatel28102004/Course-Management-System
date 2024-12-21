import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import "./collapsible.css"

export function CollapsibleButton({
    title,
    content = [],
}) {
    const [isCollapsibleOpen, setCollapsibleOpen] = useState(false);

    // Refs to measure height for smooth transition
    const collapsibleRef = useRef(null);

    // Toggle for Roster
    const toggleCollapsible = () => setCollapsibleOpen(!isCollapsibleOpen);

    return (
        <div className="course-page-container">

            {/* Roster Section */}
            <div className="roster-section">
                <button onClick={toggleCollapsible} className="w-full collapse-button flex justify-between">
                    <span>{title}</span>
                    <ChevronDown />
                </button>
                <div
                ref={collapsibleRef}
                className="collapsible-content"
                style={{
                    maxHeight: isCollapsibleOpen ? `${collapsibleRef.current.scrollHeight}px` : '0',
                }}
                >
                
                    <ul className='list-disc pl-10'>
                        {content && typeof content[0] === 'object' && content.map((item, index) =>
                            <li key={index} className='mb-2 text-lg font-normal list-item'>
                                <div> <span className='font-bold'>Day:</span> {item.day} </div>
                                <div> <span className='font-bold'>Time:</span> {item.time} </div>
                                <div> <span className='font-bold'>Venue:</span> {item.venue} </div>
                            </li>
                        )}

                        {content && typeof content[0] === 'string' && content && content.map((item, index) =>
                            <li key={index} className='mb-2 text-lg font-medium'>
                                {item}
                            </li>
                        )}
                    </ul>

                </div>
            </div>
        </div>
    );
}