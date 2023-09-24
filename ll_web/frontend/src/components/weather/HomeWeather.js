import React, { useEffect, useState, Component} from 'react';
import '../../../static/indexTailwind.css'


function HomeWeather(){
    const [currentWeather, setCurrentWeather] = useState({});
    const [weather, setWeather] = useState({});
    const [curerntLocation, setCurrentLocation] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        getWeather();
    }
    ,[])

    const getWeather = async () => {
        let location = curerntLocation != "" ? curerntLocation : "default";
        let dateTmp = date != "" ? date : "now"; 
        let timeTmp = time != "" ? time : "now"; 
        fetch(`weatherApi/data?loc=${location}&date=${dateTmp}&time=${timeTmp}`)
            .then(response => response.json())
            .then(data => {
                if (dateTmp == "now"){
                    console.log(data)
                } else {
                    
                }
            })
            .catch(error => console.error('Error:', error));
        
    }

    return(
        <div className='content flex h-screen dark:bg-zinc-700 dark:text-white'>
            <div className=''>Hello</div>
        </div>
    )
}

export default HomeWeather;