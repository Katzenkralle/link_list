import React, { useEffect, useState, Component} from 'react';
import TopBar from '../Other/TopBar';
import BottomBar from '../Other/BottomBar';
import LoadingAnimation from '../Other/LoadingAnimation';
import { settingsInputElement } from './LobbyHelper';

function HomeDurak() {
    const [roomId, setRoomId] = useState(null);
    const [roomSettings, setRoomSettings] = useState({});
    const [amIAnonymous, setAmIAnonymous] = useState(true);

    const [lockSettings, setLockSettings] = useState(false); 
    const [players, setPlayers] = useState([]); // [name, isHost
    const [isHost, setIsHost] = useState(true);

    useEffect(() => {
        updateSettings(null, "update");
    }, [lockSettings]);

    useEffect(() => {
        //am I anonymous?
        const apiUrl = `${window.location.origin}/durak/lobbyManager`;
        fetch(`${apiUrl}?amIAnonymous=true`, {
            method: "GET"
        })
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.state != 'success') {
                    throw new Error(data.state);
                }
                setAmIAnonymous(data.result);
                
            })
            .catch((error) => {
                console.log(error);
                document.getElementById('infoMSG').innerHTML = "An error occured";
            }
            )
        }, []);

    const getRoomOrCreate = (joiningRoomId) => {
        const loading = document.getElementById('loadingAnimationContainer');
        loading.hidden = false;
        const apiUrl = `${window.location.origin}/durak/lobbyManager`;
        const queryString = new URLSearchParams({
            joiningRoomId: joiningRoomId ? joiningRoomId : 'undefined',
            guestName: document.getElementById('guestName') ? document.getElementById('guestName').value : 'undefined',
        });
        fetch(`${apiUrl}?${queryString}`, {
            method: "GET"
        })
            .then((response) => {
                console.log(response);
                return response.json();
            })
            .then((data) => {
                console.log(data);
                if (data.state != 'success') {
                    throw new Error(data.state);
                } else if (data.state == "requestName"){

                } else {
                    setRoomId(data.room_info.room_id);
                    setRoomSettings(data.room_info.settings);
                    setPlayers(data.room_info.players);
                    setLockSettings(data.room_info.settings_locked);
                }
            })
            .catch((error) => {
                console.log(error);
                document.getElementById('infoMSG').innerHTML = "An error occured";
            })
            .finally(() => {
                loading.hidden = true;
                setTimeout(() => {document.getElementById('infoMSG').innerHTML = '';}, 5000);
            });
    }

    const updateSettings = (e, mode) => {        
        const formData = new FormData();
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
        formData.append("mode", mode);
        if (mode == "kick") {
            formData.append("player", e.target.value);
        } else if (mode == "start" || mode == "update") {
            formData.append("locked_settings", lockSettings);
            Object.entries(roomSettings).forEach(([key, value]) => {
                formData.append(key, document.getElementById(key).value);
            });
        }

        fetch(`${window.location.origin}/lobbyManager`, {
        method: 'POST',
        body: formData,
        }).then(response => {})
        .catch(error => console.log(error))
    }

    const playerList = () => {
        return (
            <div className='flex flex-col infoContainer lg:w-1/2 h-[500px] lg:mr-1 !p-2'>
                <h3 className='infoHl'>Players</h3>
                <div className={`grid grid-rows-auto grid-cols-${isHost ? 2 : 1} gap-y-2`}>
                    {players.map((player) => {
                        return (
                            <>
                                <p key={player}>- {player}</p>
                                {isHost ?
                                <button className='inputElement' 
                                value={player} 
                                onClick={(e) => updateSettings(e, "kick")}
                                >Kick</button> 
                                : null}
                            </>
                        )
                    })}
                </div>
                <p>Players: {players.length}</p>
            </div>
        )
    }

    const roomInfo = () => {
        return (
        <div className='flex flex-col infoContainer lg:w-1/2 h-[500px] lg:ml-1 !p-2 sm:mt-4 '>
        
        <h3 className='infoHl'>Room Settings</h3>
            <div className='grid grid-cols-2 grid-rows-auto gap-y-2'>
                {Object.entries(roomSettings).map(([key, value]) => {
                    return (
                        settingsInputElement(key, value, isHost, lockSettings)
                    )
                })}
            </div>
            
            {isHost ?
            <div>
                <label htmlFor="lockSettings" className='mr-2'>Lock Settings</label>
                <input type='checkbox'
                id="lockSettings"
                defaultChecked={lockSettings}
                onChange={e => setLockSettings(e.target.checked)} />

                <button className={`inputElement w-fit mt-2 mx-auto ml-4 ${!lockSettings ? 'disabledInput' : ''}`}
                disabled={!lockSettings}
                onClick={() => updateSettings(null, "start")}
                >Start Game</button>
            </div>
            : null}
            
        </div>
        )
    }

    const mainContent = () => {
        if (!roomId) {
            return (
                <div className='flex flex-col w-max justefy-center '>
                    <div className='flex flex-row my-1 justify-between'>
                        <input className='inputElement mr-1' id='roomId' placeholder='Room ID'/>
                        <button className="inputElement" onClick={() => getRoomOrCreate(document.getElementById('roomId').value)}>Join</button>
                    </div>
                    <input className='inputElement my-1' id='guestName' placeholder='Guest Name' hidden={!amIAnonymous}/>
                    <button className='inputElement' onClick={() => getRoomOrCreate("create")}>Create Room</button>
                    <p id="infoMSG" className='text-cat-error'></p>
                </div>
            )
        } else {
            return (
                <div className='w-full flex flex-col'>
                    <p className='infoHl'>Waiting for Host and Players..</p>
                    <p className='mb-4'>Room ID: {roomId}</p>
                    <div className='flex sm:flex-col lg:flex-row w-screen'>
                        {playerList()}
                        {roomInfo()}
                    </div>
                </div>
            )
        }
    }

    return (
    <div className='content flex flex-col text-cat-main'>
            {TopBar()}
            <main className='max-w-[1624px] mx-auto shrink-0 grow-0 overflow-x-hidden'>
                <h1 className='mainHl'>Lobby</h1>
                {mainContent()}
            </main>
            {BottomBar()}
            <div id="loadingAnimationContainer" hidden><LoadingAnimation/></div>
    </div>
  )
}

export default HomeDurak;