import React, { useState, useEffect } from "react";
import ReactDOM from 'react-dom/client';
import LoadingAnimation from "../Other/LoadingAnimation";


export const downloadBlob = (blob, fileName) => {
    const link = document.createElement('a');
    // create a blobURI pointing to our Blob
    const file = new Blob([blob])
    link.href = URL.createObjectURL(file);
    link.download = `${fileName.split('.')[0]}_down`;
    document.body.appendChild(link); // Required for this to work in FireFox
    link.click();
    return link.href
    }; 

function MediaContentManager(props){
    const [contentType, setContentType] = useState(props.contentType)
    const [content, setContent] = useState([])
    const [nextDatasetToFetch, setNextDatasetToFetch] = useState(0)
    const [possitionContext, setPossitionContext] = useState(undefined)
    const [filesToUpload, setFilesToUpload] = useState([])
    const [status, setStatus] = useState("loading")

    const [filter, setFilter] = useState("all")
    
    let allFiles = []

    const DATASETSPERFETCH = 10
    useEffect(() => {
        getContent()
    }, [nextDatasetToFetch])

    const freeMemory = () => {
        allFiles.map((file) => {
            //free memory
            URL.revokeObjectURL(file)
        })
        allFiles = []
    }

    const selfDestruct = () => {
        freeMemory()
        ReactDOM.createRoot(document.getElementById('mediaContentManager')).unmount();
    }         

    const getContent = () => {
        setStatus("loading")
        freeMemory()
        fetch(`linkListApi/mediaContent?type=${contentType}&datasets=${DATASETSPERFETCH}&next=${nextDatasetToFetch}`)
            .then(response => {
                setStatus("hidden")
                return response.json()
            }).then(data => {
                if (data.status != "success") {
                    setStatus([data.status])
                    return
                }
                setPossitionContext(data.possition)
                data.content.map((media) => {
                    media.new_name = media.name
                })
                setContent(data.content)
            }).catch(error => {
                console.log(error)
            })
    }

    const uploadContent = () => {
        setStatus("loading")
        const formData = new FormData();
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
        formData.append("alowed_types", contentType)
        formData.append("mode", "upload")
        
        for (const file of filesToUpload) {
            formData.append("files[]", file)
        }

        fetch("linkListApi/saveMedia/", {
        method: 'POST',
        body: formData,
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        }).then(data => {
            setFilesToUpload([])
            setStatus(data.status)
            setTimeout(() => { setStatus("hidden"); getContent() } , 4000)
        }).catch(error => {
            console.log(error)
        })
    }

    const updateContent = (mode, name, new_name) => {
        setStatus("loading")
        const formData = new FormData();
        formData.append("csrfmiddlewaretoken", document.querySelector('[name=csrfmiddlewaretoken]').value)
        formData.append("mode", mode)
        formData.append("name", name)
        mode == "rename" ? formData.append("new_name", new_name) : null
        fetch("linkListApi/mediaContent/", {
        method: 'POST',
        body: formData,
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json()
        }).then(data => {
            if (data.status != "done") {
                throw new Error(`${data.status}`);
            }
            getContent()
        }).catch(error => {
            setStatus([error.message])
            setTimeout(() => { setStatus("hidden") } , 4000)
        })
       
    }

    const base64ToFile = (base64, type) => {
    // Decode the base64-encoded image data
    const imageData = atob(base64);

    // Create a blob from the decoded data
    const blob = new Blob([new Uint8Array([...imageData].map(char => char.charCodeAt(0)))], { type: type });

    // Create a URL for the blob
    const fileUrl = URL.createObjectURL(blob);
    allFiles = [...allFiles, fileUrl]
    return fileUrl
    }



    const infoOverlay = (otherInfo) => {
        if (status == undefined || status == "hidden") {
            return
        }
        return(
            <div id="infoOverlay" className="absolute left-0 w-full h-full bg-cat-overlay bg-opacity-50">
                {status === "loading" ? (
                <LoadingAnimation></LoadingAnimation>
                ) : (
                    <div className="flex h-full">
                    <div className="bg-cat-bg2 m-auto rounded-lg p-3">
                      <ul>
                        {Array.isArray(status) ? (
                          status.map((state) => (
                            <li key={state} className="text-cat-error">
                              {state}
                            </li>
                          ))
                        ) : (
                          Object.entries(status).map(([key, value]) => (
                            <li
                              key={key}
                              className={value === "created" ? "text-cat-success" : "text-cat-error"}
                            >
                              {value === "created" ? `${key} was created` : `${key} was not created`}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>                  
                )}
            </div>
        )}

    const filterContent = (e) => {
        let filterOptions = []
        return(
            <div className="flex flex-row">
                <select className="inputElement" onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All</option>
                    {content
                    .map((media) => {
                        if (filterOptions.includes(media.type)) {
                            return
                        }
                        filterOptions.push(media.type);
                        return <option key={media.type} value={media.type}>{media.type}</option>;
                    })}
                </select>
            </div>
        )
    }


    const displayMedia = () => {
        if (content == undefined || content.length == 0) {
            return (
                <p className="text-cat-main">No content found</p>
            )
        }
       
        return (
            <div className="flex flex-row flex-wrap">
                {content.filter((media) => filter == "all" ? true : media.type == filter)
                .map((media, key) => (
                    <div className={`grid gap-x-1 gap-y-2 grid-cols-4 grid-rows-3 py-1 h-32 ${key % 2 ? "bg-cat-bg" : "bg-cat-bg2"}`}>
                        
                        <img src={base64ToFile(media.file, media.type)} className="row-span-3 self-center object-fit max-h-full" />

                        <input 
                        className="infoHl col-span-2 bg-inherit cursor-pointer rounded-lg text-ellipsis overflow-hidden
                        hover:outline hover:outline-2 hover:outline-cat-border hover:bg-cat-input 
                        focus:outline focus:outline-2 focus:outline-cat-border focus:bg-cat-input" 
                        type="text" id={`${media.name}Name`} 
                        value={media.new_name}
                        onChange={(e) => setContent(content.map((item, i) => 
                            (i === key ? { ...item, new_name: e.target.value } : item)))}
                        ></input>

                        <button 
                        className="inputElement" 
                        onClick={() => updateContent("rename", media.name, document.getElementById(`${media.name}Name`).value)}
                        >Rename</button>
                        

                        <p className="text-cat-main col-span-2">{media.type}</p>
                        <button 
                        className="inputElement" 
                        onClick={() => updateContent("delete", media.name)}
                        >Delete</button>

                        <button 
                        className="inputElement col-start-4"
                        onClick={() => {props.selectedImg(media); selfDestruct()} }
                        >Select</button>
                    </div>
                    
                ))}
        </div>
        )
    }

    return (
        <div className="overlay !z-50">
          <div className="absolute top-0 right-0 h-full bg-cat-surface p-2 flex flex-col lg:w-1/2 w-full">
            <div>
            <button
              className="inputElement"
              onClick={() => selfDestruct()}>Close</button>
            {filterContent()}
            </div>

            <div className="flex flex-col h-full overflow-y-scroll overflow-x-hidden">
                <h3 className="infoHl">Media Manager</h3>
        
                {displayMedia()}


                {possitionContext != undefined ? (
                <div className="flex flex-row mb-2">
                    {possitionContext.start - DATASETSPERFETCH >= 0 ? (
                    <button
                    className="inputElement mr-auto"
                    onClick={() => setNextDatasetToFetch(possitionContext.start - DATASETSPERFETCH)}
                    disabled={nextDatasetToFetch == 0}>
                    Previous</button>) : null}
                    
                    {possitionContext.end < possitionContext.total ? (
                    <button
                    className="inputElement ml-auto"
                    onClick={() => setNextDatasetToFetch(possitionContext.start + DATASETSPERFETCH)}
                    disabled={content.length < DATASETSPERFETCH}>
                    Next</button>) : null}
                </div>)
                : null}


                <div className="mt-auto flex flex-row justify-between">
                    <label htmlFor="imgToUpload">
                        <p className="inputElement cursor-pointer">Select new files</p>
                    </label>
                    <input
                    type="file"
                    id="imgToUpload"
                    accept={contentType.join(",")}
                    onChange={(e) => setFilesToUpload(e.target.files)}
                    multiple
                    className="hidden"
                    />

                    {filesToUpload.length > 0 ? (
                    <button
                    className="inputElement"
                    onClick={() => uploadContent()}
                    >Upload</button>) :
                    null}
                </div>

                <div className="flex flex-col !text-cat-main max-h-32 overflow-y-scroll">
                        {filesToUpload.length > 0 && (
                            <>
                                <h3 className="infoHl">Selected files:</h3>
                                    {Array.from(filesToUpload).map((file) => (
                                        <div key={file.name}
                                        className="grid gap-x-1 gap-y-2 grid-cols-3 grid-rows-1 my-1">
                                            <p className="truncate mr-2 col-span-2">{file.name}</p>

                                            <button className="inputElement"
                                            onClick={() => {{
                                                let newFilesToUpload = []
                                                for (const iFile of filesToUpload) {
                                                    if (iFile.name == file.name) {
                                                        continue
                                                    }
                                                    newFilesToUpload.push(iFile)
                                                }
                                                setFilesToUpload(newFilesToUpload)
                                            }}
                                            }
                                            >Remove</button></div>
                                    ))}
                            </>
                        )}
                </div>
                
                {infoOverlay()}
          </div>
          </div>
        </div>
      );
      
}

export default MediaContentManager;