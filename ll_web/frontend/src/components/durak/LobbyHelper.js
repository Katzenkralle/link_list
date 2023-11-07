import React, { useEffect, useState, Component} from 'react';

export const settingsInputElement = (inputVar, value, isHost, lockedSettings) => {
    const nameMapping = {
        "push": {"name": "Pushing cards to the next Player", "type": "select", "options": ["on", "off"]},
        "max_players": {"name": "Max Players", "type": "number"},
        "decks_to_use": {"name": "Decks To Use", "type": "number"},
    }
    return (
        <>
        <p>{inputVar in nameMapping ? nameMapping[inputVar].name : inputVar}</p>
        {!isHost ? 
            <p>{value}</p>
        :
        inputVar in nameMapping && nameMapping[inputVar].type == 'select' ? (
        <select className={`inputElement w-fit ${lockedSettings ? 'disabledInput' : ''}`}
        disabled={lockedSettings}
        id={inputVar}>
            {nameMapping[inputVar].options.map((option) => {
                return <option value={option}>{option}</option>
            })}
        </select> 
        ) : (
        <input className={`inputElement w-fit ${lockedSettings ? 'disabledInput' : ''}`}
        id={inputVar}
        disabled={lockedSettings}
        type={inputVar in nameMapping ? nameMapping[inputVar].type : 'text'} 
        defaultValue={value} />
        )
        }
        </>
        
    )
}