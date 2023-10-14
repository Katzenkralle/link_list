import React from 'react';
import '../../../static/animations.css';

function LoadingAnimation() {
    return (
    <main className='overlay flex justify-center items-center z-20' id="loadingAnimation">
		<svg className="w-2/5" viewBox="0 0 256 128">
			<defs>
				<linearGradient id="grad1" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0%" stopColor="#A6D189" />
					<stop offset="33%" stopColor="#EF9F76" />
					<stop offset="67%" stopColor="#E78284" />
					<stop offset="100%" stopColor="#CA9EE6" />
				</linearGradient>
				<linearGradient id="grad2" x1="1" y1="0" x2="0" y2="0">
					<stop offset="0%" stopColor="#CA9EE6" />
					<stop offset="33%" stopColor="#8CAAEE" />
					<stop offset="67%" stopColor="#99D1DB" />
					<stop offset="100%" stopColor="#A6D189" />
				</linearGradient>
			</defs>
			<g fill="none" strokeLinecap="round" strokeWidth="16">
				<g className="ip__track" stroke="#ddd">
					<path d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"/>
					<path d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"/>
				</g>
				<g strokeDasharray="180 656">
					<path className="ip__worm1" stroke="url(#grad1)" strokeDashoffset="0" d="M8,64s0-56,60-56,60,112,120,112,60-56,60-56"/>
					<path className="ip__worm2" stroke="url(#grad2)" strokeDashoffset="358" d="M248,64s0-56-60-56-60,112-120,112S8,64,8,64"/>
				</g>
			</g>
		</svg>
</main>
    );
    }
export default LoadingAnimation;