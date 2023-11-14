import React, { useEffect, useState, Component} from 'react';

function BottomBar(){

    const boder = () => {
        return(
            <div className='lg:w-1 lg:h-full sm:h-1 sm:w-full sm:my-2 bg-cat-light'/>
        )
        }



    const infoWeather = () => {
        return(
        
        <div className='flex lg:flex-row sm:flex-col'>
            {boder()}
            <div className='flex flex-col shrink-0 mx-4 whitespace-normal'>
                <h3 className='infoHl'>Weather</h3>
                <div>Information about
                <a className='link' href='https://somnia-notas.urmel.duckdns.org/qLinkList?li=9'> processing of weather data</a>.</div>
                <div>Weather since 07.10.2023 onwards from 
                    <a className='link' href='https://openweathermap.org/'> OpenWeather</a>.</div>
                <div >Historical dates from 
                    <a className='link' href='https://open-meteo.com/'> Open-Meteo</a>.</div>
                <div >Weather icons from
                    <a className='link' href='https://thenounproject.com/'> Noun Project</a>.</div>          
            </div>
        </div>
        )
    }

    return(
    <div className='flex flex-col z-30'
    style={{transform: 'scale(1)', transformOrigin: '0% 0% 0px' }}
    id="footer">
        {/* Used to render always below the screen */}
        <div className='flex flex-grow'>&nbsp;</div>

        <div className="flex flex-wrap bg-cat-bg2 mt-1 p-4">
                <div className='flex flex-col shrink-0 mx-4'>
                    <h3 className='infoHl'>Places</h3>
                    <a className='link' href='/'>Home</a>
                    <a className='link' href='/linkList'>Somnia Notas</a>
                    <a className='link' href='/weather'>Weather</a>
                    <a className='link' href='/asciiColor'>Img-to-Ascii</a>   
                    <a className='link' href='https://github.com/Katzenkralle/link_list'>GitHub</a>
                    <a className='link' href='/settings'>Settings</a>
                </div>

                {/* Show the foloring based on current Page */}
                {window.location.pathname === '/weather' ? (
                infoWeather()
                ) : null}
        </div>
    </div>

    )
}

export default BottomBar;