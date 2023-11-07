import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import TopBar, { topBar } from '../Other/TopBar';
import BottomBar from '../Other/BottomBar';
import MediaContentManager, {downloadBlob} from "./MediaContentManager";
import ConfirmDialog from "../Other/ConfirmDialog";
import LoadingAnimation from "../Other/LoadingAnimation";

function HomeAsciiColor() {

    const [ignoreBrightness, setIgnoreBrightness] = useState(255)
    const [colorizeMode, setColorizeMode] = useState({"f": true, "b": true})
    const [sizeWarning, setSizeWarning] = useState(false)
    const [allFiles, setAllFiles] = useState([])

    const [selectedImg, setSelectedImg] = useState(null)
    const [transformedImg, setTransformedImg] = useState(null)

    const transform = (colorize, download) => {
        const loading = document.getElementById("loadingAnimationContainer")
        loading.hidden = false
        allFiles.map((file) => {
            URL.revokeObjectURL(file)
        })
        setAllFiles([])
        setColorizeMode({"f": true, "b": true})

        const imgName = selectedImg.name;
        const adjustWidth = document.getElementById("adjustWidth").value;
        const outputWidth = document.getElementById("outputWidth").value;
        const outputHeight = document.getElementById("outputHeight").value;
        const invertBrightness = document.getElementById("invertBrightness").checked;
        const onlyUseBlocks = document.getElementById("onlyUseBlocks").checked;
        
        download = download || false;
        const apiUrl = `${window.location.origin}/playground/imgToAscii/`;

        const queryString = new URLSearchParams({
            name: imgName,
            adjustWidth: adjustWidth,
            outputWidth: outputWidth,
            outputHeight: outputHeight,
            invertBrightness: invertBrightness,
            onlyUseBlocks: onlyUseBlocks,
            ignoreBrightness: ignoreBrightness,
            colorizeOutput: colorize != undefined ? colorize : "fb",
            download: download,
        });
        fetch(`${apiUrl}?${queryString}`, {
            method: "GET"
        })
        .then((response) => {
            if (download) {
                return response.text()
            } else {
                return response.json();
            }
        })
        .then((data) => {
            if (download) {
                if (data.slice(0, 9) == "listSaved") {
                    const listId = parseInt(data.match(/\d+/),10)
                    ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog
                        onConfirmation={(e) => {e ? window.location.href = `/linkList#${listId}` : null}} 
                        question="The Link List was saved!" 
                        trueBtnText="Open List" 
                        falseBtnText="Stay" />)
                    return
                }
                setAllFiles([...allFiles, downloadBlob(data, imgName)])
                return
            }
            console.log(data);
            console.log((data.transformed_img.length * data.transformed_img[0].length) >= (300*600));
            setSizeWarning((data.transformed_img.length * data.transformed_img[0].length) >= (300*600));
            setTransformedImg(data);
        })
        .catch((error) => {
            ReactDOM.createRoot(document.getElementById("tagContainer")).render(<ConfirmDialog
                onConfirmation={(e) => {e ? window.location.reload() : null}} 
                question="An Error occured!" 
                trueBtnText="Reset" 
                falseBtnText="Retrey" />)
            console.error("Error:", error);
        }).finally(() => {
            loading.hidden = true
        });
    }
    

    const setZoom = (zoom, element, translationElement, growVertically) => {
        let transformOrigin = [0, 0];
        element = element || instance.getContainer();
        translationElement = translationElement || document.getElementById('footer');
        growVertically = growVertically || document.getElementById('growVertically');
        
        // Calculate the amount of translation based on the zoom
        let translationAmount = ((1 - zoom) * element.clientHeight) * -1;
    
        // Adjust the height of the parent element based on the zoom
        if (true) {
            let newHeight = element.clientHeight * zoom;
            growVertically.style.height = `${newHeight}px`;
        }
    
        // Apply zoom transformation
        let scale = "scale(" + zoom + ")";
        let origin = (transformOrigin[0] * 100) + "% " + (transformOrigin[1] * 100) + "%";
        let transformProperty = ["webkit", "moz", "ms", "o", ""].map(prefix => `${prefix}Transform`);
        let originProperty = ["webkit", "moz", "ms", "o", ""].map(prefix => `${prefix}TransformOrigin`);
    
        [...transformProperty, ...originProperty].forEach(property => {
            element.style[property] = scale;
            element.style[property + "Origin"] = origin;
        });
    
        // Apply translation to the translationElement
        //translationElement.style.transform = `translateY(${translationAmount}px)`;
    };

    const toolbar = () => {
        return (
            <div className="grid grid-cols-2 gap-4 infoContainer !p-2 h-[500px]">
                <h3 className="col-span-2 infoHl col-span-2">Transformation Settings</h3>
                
                <p className="">Stretch Width to account for character size</p>
                <input type="number" step={0.05} id="adjustWidth" className="inputElement h-fit self-center" defaultValue={2} />
                
                <p>Output Width (0: same as Input)</p>
                <input type="number" id="outputWidth" className="inputElement h-fit self-center" defaultValue={64} />

                <p>Output Height (0: same as Input)</p>
                <input type="number" id="outputHeight" className="inputElement h-fit self-center" defaultValue={128} />

                <p>Invert brightness of output</p>
                <input type="checkbox" id="invertBrightness" className="h-5 self-center" />
            
                <p>Make brighter parts Transparent</p>
                <div className="flex flex-wrap">
                    <input
                        type="range"
                        min={0}
                        max={255}
                        value={ignoreBrightness}
                        id="ignoreBrightness"
                        className="w-full"
                        onChange={(e) => setIgnoreBrightness(e.target.value)}
                    />
                    <p className="ml-4">{ignoreBrightness}</p>
                </div>
                
                <p>Only use █ (U+2588)</p>
                <input type="checkbox" id="onlyUseBlocks" className="h-5 self-center" />

                <button
                    id="selectImg" 
                    className="inputElement"
                    onClick={() => {
                        ReactDOM.createRoot(document.getElementById("mediaContentManager"))
                        .render(<MediaContentManager contentType={["image/*"]} selectedImg={(e) => setSelectedImg(e)}/>)
                    }}
                > Select</button>
                <button 
                    id="transform" 
                    className={`inputElement ${selectedImg == null ? "disabledInput" : ""}`}
                    onClick={() => {
                        selectedImg == null ? null : 
                        transform()
                    }}
                > Transform</button>
            </div>
        )
    }

    const originalImg = () => {
        return selectedImg != null ? (
            <div className="flex flex-col h-[500px] infoContainer !p-2">
                <h3 className="infoHl">Original Img</h3>
                <img
                    className="h-full object-contain object-center"
                    src={`${window.location.origin}/linkListApi/mediaContent/?id=${selectedImg.id}`}
                    alt={selectedImg.name}
                />
            </div>
        ) : (
            <div className="flex flex-col h-[500px] infoContainer !p-2">
                <h3 className="infoHl">No Image selected</h3>
                <p>Please select an Image or upload a new one!</p>
            </div>
        );
    };


    const transformedImgElement = () => {
        if (transformedImg == null) {
            return
        }

        return (
            <div className="m-2 p-2">
                <h3 className="infoHl">Transformed Img</h3>
                <div className='flex flex-wrap inputElement mx-1 mb-2 mt-3 items-center'>
                {!transformedImg.only_use_blocks ? (
                    <>
                        <h3 className="font-bold mr-4">Color Options</h3>
                        <div>
                            <input 
                            type="checkbox" 
                            className="mr-1" 
                            checked={colorizeMode.f} 
                            id="colorizeModeF"
                            onChange={(e) => setColorizeMode({"f": e.target.checked, "b": colorizeMode.b })}/>
                            <label className="mr-2" htmlFor="colorizeModeF">Foreground</label>
                        </div>
                        <div>
                            <input type="checkbox" 
                            className="mr-1"
                            id="colorizeModeB" 
                            checked={colorizeMode.b}
                            onChange={(e) => setColorizeMode({"f": colorizeMode.f, "b": e.target.checked })}/>
                            <label className="mr-4" htmlFor="colorizeModeB">Background</label>
                        </div>
                    </>) : null}
                    
                        {!colorizeMode.f && !colorizeMode.b ? (
                            <button className="link mr-3"
                            onClick={() => transform("saveInLl", true)}>
                                Save in new Link List
                            </button>
                        ) : null}

                        <button className="link" 
                        onClick={() => transform(`${colorizeMode.b ? "b" : " "}${colorizeMode.f ? "f" : " "}`, true)}
                        >Download</button>

                        <button className="link ml-auto" 
                        onClick={() => setTransformedImg(null)}
                        >Reset</button>
                    </div>

                <div className="flex flex-wrap inputElement mx-1 mb-2 mt-3">
                    <p className="font-bold mr-4">Zoom</p>
                    <input 
                    id = "zoom"
                    type="range"
                    min={1}
                    max={15}
                    defaultValue={10}
                    className="mr-2"
                    onChange={(e) => setZoom((Number(e.target.value)/10),document.getElementById('transformedArtContainer'))}/>
                </div>

                {sizeWarning ? (
                    <div className="flex flex-col">
                        <h3 className="infoHl">Large file!</h3>
                        <p>Due to the chosen size of the output, if you precede your browser might crash!</p>
                        <p>However, you can download the output file and display it in your terminal or text editor</p>
                        <p>Displaying in Terminal (Linux/Windows): cat /path/to/the/file</p>
                        <button className="inputElement mb-2" onClick={() => setSizeWarning(false)}>Precede</button>
                    </div> ) : ( 
                
                    <div className="overflow-x-scroll overflow-y-hidden" id="growVertically" style={{height: "auto"}}>
                        <div className="flex flex-col whitespace-pre text-ellipsis font-dejavuSansMono leading-none tracking-tighter"
                        id="transformedArtContainer"
                        style={{transform: 'scale(1)', transformOrigin: '0% 0% 0px' }}>
                            {transformedImg.transformed_img.map((line, lineIndex) => {
                                return (
                                    <div key={lineIndex} className="flex flex-row">
                                        {line.map((char, charIndex) => {
                                            return (
                                                <p 
                                                key={charIndex}
                                                style={{
                                                    color: colorizeMode.f ? `rgba(${char[1].join(',')})` : "#FFFFFF",
                                                    backgroundColor: colorizeMode.b ? `rgba(${char[1].join(',')})` : null
                                                }}
                                                >{char[0]}</p>
                                            )
                                        })}
                                    </div>
                                )
                            } )}
                        </div> 
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className='content flex flex-col text-cat-main'>
            {TopBar()}

            <main className="flex flex-col"
            id="mainContainer">
                <h1 className="mainHl text-center">Img-to-Ascii</h1>
                <div className="flex lg:felx-row sm:flex-col sm:flex-col-reverse lg:max-w-[1624px] lg:mx-auto">
                    <div className="lg:w-4/6 m-2">
                        {originalImg()}
                    </div>
                    <div className="lg:w-4/6 m-2">
                        {toolbar()}
                    </div>
                </div>
                {transformedImgElement()}
                <div id="mediaContentManager"></div>
                <div id="tagContainer"></div>
                <div id="loadingAnimationContainer" hidden><LoadingAnimation/></div>
            </main>
            
            
            {BottomBar()}

            
        </div>
    )
}

export default HomeAsciiColor;