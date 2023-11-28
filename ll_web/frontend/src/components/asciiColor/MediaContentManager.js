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
    const contentType = props.contentType
    const allowForeign = props.allowForeign
    const [content, setContent] = useState([])
    const [allContentTypes, setAllContentTypes] = useState([])
    const [nextDatasetToFetch, setNextDatasetToFetch] = useState(0)
    const [possitionContext, setPossitionContext] = useState(undefined)
    const [filesToUpload, setFilesToUpload] = useState([])
    const [status, setStatus] = useState("loading")

    
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

    const getContent = (filterType, search) => {
        setStatus("loading")
        freeMemory()
        const queryString = new URLSearchParams({
            csrfmiddlewaretoken: document.querySelector('[name=csrfmiddlewaretoken]').value,
            type: contentType,
            datasets: DATASETSPERFETCH,
            next: nextDatasetToFetch,
            filter: filterType != undefined ? filterType : "all",
            search: search != undefined ? search : ""
        })

        fetch(`linkListApi/mediaContent?${queryString}`)
            .then(response => {
                setStatus("hidden")
                return response.json()
            }).then(data => {
                if (data.status != "success") {
                    setStatus([data.status])
                    return
                }
                setAllContentTypes(data.allContentTypes)
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

    const filterContent = (e) => {
        let filterOptions = []
        return(
            <div className="flex flex-row justify-between my-1 max-w-full">
                <input className="inputElement w-2/5" id="search" type="text" placeholder="Search"></input>
                <select className="inputElement w-2/5 mx-1" id="typeFilter">
                    <option value="all">All</option>
                        {allContentTypes.map((type) => {
                            filterOptions.push(type);
                            return <option key={type} value={type}>{type}</option>;
                        })}
                </select>
                <button className="inputElement w-1/5" onClick={() => getContent(document.getElementById('typeFilter').value, document.getElementById('search').value)}>Filter</button>
            </div>
        )
    }

    const importForeign = () => {
        return(
            <div className="flex flex-row justify-between my-1 max-w-full">
                <input className="inputElement w-2/5" id="foreignUrl" type="text" placeholder="Import Foreign Media by URL"></input>
                <select className="inputElement w-2/5 mx-1" id="foreignType">
                    <option value="image/*">Image</option>
                    <option value="video/*">Video</option>
                    <option value="audio/*">Audio</option>
                    <option value="application/*">Other</option>
                </select>
                <button className="inputElement w-1/5"
                onClick={() => {props.selectedImg({"name": document.getElementById('foreignUrl').value,
                               "type": document.getElementById('foreignType').value});
                                selfDestruct()}}
                >Import</button>
            </div>
        )
    }

    const topBar = () => {
        return(
            <div className="flex flex-col max-w-full">
                <button
                    className="inputElement ml-auto"
                    onClick={() => selfDestruct()}>Close</button>
                {filterContent()}
                {allowForeign ? (importForeign()) : null}
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
                {content
                .map((media, key) => (
                    <div className={`grid gap-x-1 gap-y-2 grid-cols-4 grid-rows-3 py-1 h-32 ${key % 2 ? "bg-cat-bg" : "bg-cat-bg2"} w-full`}>
                        <a className="row-span-3 flex justify-center align-center" href={`${window.location.origin}/linkListApi/mediaContent/?id=${media.id}`}>
                        <img src={base64ToFile(media.file, media.type)} className="object-fit self-center justify-self-center max-h-full" />
                        </a>
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
                        

                        <p className="text-cat-main col-span-2 row-span-2 text-ellipsis overflow-hidden">{media.type}</p>
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

    const footer = () => {
        return (
            <>
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
            </>
        )
    }

    const imgToUpload = () => {
        return filesToUpload.length > 0 ? (
          <div className="max-h-32">
            <div className="flex flex-col !text-cat-main h-full overflow-y-scroll">
              <>
                <h3 className="infoHl">Selected files:</h3>
                {Array.from(filesToUpload).map((file) => (
                  <div key={file.name} className="grid gap-x-1 gap-y-2 grid-cols-3 grid-rows-1 my-1">
                    <p className="truncate mr-2 col-span-2">{file.name}</p>
                    <button
                      className="inputElement"
                      onClick={() => {
                        let newFilesToUpload = filesToUpload.filter((iFile) => iFile.name !== file.name);
                        setFilesToUpload(newFilesToUpload);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </>
            </div>
          </div>
        ) : null;
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

    return (
        <div className="overlay !z-50">
          <div className="absolute top-0 right-0 h-full bg-cat-surface p-2 flex flex-col lg:w-1/2 w-full max-w-[800px]">
            {topBar()}
            <h3 className="infoHl">Media Manager</h3>
            <div className="flex flex-col h-full overflow-y-scroll overflow-x-hidden">
    
                {displayMedia()}

                {footer()}

                {imgToUpload()}
                
                {infoOverlay()}
            </div>
          </div>
        </div>
      );
      
}

export default MediaContentManager;