import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { DropdownContext } from "../helpers/DropdownContext";
import { ScreenContext } from '../helpers/ScreenContext';
import { SuggestionsContext } from "../helpers/SuggestionsContext";
import { ImageContext } from "../helpers/ImageContext";
import EditProfileCSS from '../styles/EditProfile.module.css';

function EditProfile() {
    let navigate = useNavigate();
    const [bioText, setBioText] = useState('');
    const { authState } = useContext(AuthContext);
    const { arrowState, setArrowState } = useContext(ScreenContext);
    const { dropdownState, setDropdownState } = useContext(DropdownContext);
    const { suggestionsState, setSuggestionsContext } = useContext(SuggestionsContext);
    const { imageState, setImageState } = useContext(ImageContext);
    const [ bioSize, setBioSize] = useState(0);
    const [ imgData, setImgData ] = useState([])
    const [errMsg, setErrMsg] = useState('');
    const [urlLink, setUrlLink] = useState(null);
    const [validUrlLink, setValidUrlLink] = useState(false);


    const URL_REGEX= /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

    useEffect(()=>{
        if (!localStorage.getItem("accessToken"))
            navigate("/");
    },[])

    const checkUrl = (e) => {
        setUrlLink(e.target.value)
        setErrMsg('')
        
    } 
    


    useEffect(()=>{
        //axios.get(`http://3.20.232.190:3001/getAvatar/${authState.id}`)
        axios.get(process.env.REACT_APP_HTTP_REQ+`/getAvatar/${authState.id}`)
        .then(res=>setImgData(res.data[0]))
        .catch(err=>console.log(err))
    },[])


    const addBio = () => {
        
        //axios.post("http://3.20.232.190:3001/addBio",{
        axios.post(process.env.REACT_APP_HTTP_REQ+"/addBio",{
            bioText
        },{
            headers: {accessToken: localStorage.getItem("accessToken")}
        }).then((res)=>{
            alert(res.data);
            setBioText('')
        })
        .catch(err=>console.log(err));
       
    }

    const deleteLink = () => {
        axios.post(process.env.REACT_APP_HTTP_REQ+`/deleteUrlLink/${authState.id}`,{
        },{
            headers: {accessToken: localStorage.getItem("accessToken")}
        }).then((res)=>{
            alert(res.data);
        })
        .catch(err=>console.log(err));

    }
    
    const addLink = (event) => {
        event.preventDefault();
        if(!URL_REGEX.test(urlLink)){
            
            setErrMsg("invalid url")
            return;
        }
        axios.post(process.env.REACT_APP_HTTP_REQ+"/addUrlLink",{
            urlLink
        },{
            headers: {accessToken: localStorage.getItem("accessToken")}
        }).then((res)=>{
            alert(res.data);
            setUrlLink('')
        })
        .catch(err=>console.log(err));

    }

    const handleBioChange = (e) => {
        setBioSize(e.target.value.length);
        setBioText(e.target.value);
    }

    const [theBio, setTheBio] = useState(false)
    const [theLink, setTheLink] = useState(false)
    const [theRemoveLink, setTheRemoveLink] = useState(false)
    const [theImageUpload, setTheImageUpload] = useState(false)
    let bioRef = useRef();
    let linkRef = useRef();
    let removeLinkRef = useRef();
   

    useEffect(()=>{ 
        let theBioHandler = (e)=>{
          //console.log(menuRef.current.contains(e.target))
          if(!bioRef.current?.contains(e.target) ){ //? allows it to work in / and /signup
              setTheBio(false);
      
              
          }
        }
        document.addEventListener("mousedown", theBioHandler);
        return()=>{
          document.removeEventListener("mousedown", theBioHandler);
        }
       })

       useEffect(()=>{ 
        let theLinkHandler = (e)=>{
          //console.log(menuRef.current.contains(e.target))
          if(!linkRef.current?.contains(e.target) ){ //? allows it to work in / and /signup
              setTheLink(false);
      
              
          }
        }
        document.addEventListener("mousedown", theLinkHandler);
        return()=>{
          document.removeEventListener("mousedown", theLinkHandler);
        }
       })

       useEffect(()=>{ 
        let theRemoveLinkHandler = (e)=>{
          //console.log(menuRef.current.contains(e.target))
          if(!removeLinkRef.current?.contains(e.target) ){ //? allows it to work in / and /signup
              setTheRemoveLink(false);
      
              
          }
        }
        document.addEventListener("mousedown", theRemoveLinkHandler);
        return()=>{
          document.removeEventListener("mousedown", theRemoveLinkHandler);
        }
       })

       
    

  return (
    <ImageContext.Provider value={{ imageState, setImageState, theImageUpload, setTheImageUpload }}>
        
    <div className={EditProfileCSS.editProfile}>
        {theBio || theLink || theImageUpload || theRemoveLink? (
        <div
            className={EditProfileCSS.editProfileBackground}
            >
        </div>
        ) : <></>}
        <h2 className={EditProfileCSS.editBioTitle}>Edit Bio</h2>
        <div className={EditProfileCSS.clickButton} onClick={()=>setTheBio(!theBio)}>+</div>
        <div className={EditProfileCSS.editBio}>
            <form>
            
                {theBio && (<div ref={bioRef} className={EditProfileCSS.makeAbsolute}>
                    <div className={EditProfileCSS.exit} onClick={()=>setTheBio(!theBio)}>x</div>
                    {bioSize == 150 ? <p className={EditProfileCSS.charLimit}>Character Limit Reached</p> : <p className={EditProfileCSS.hidden}></p>}
                    <textarea
                        placeholder="Enter the bio..."
                        id = "bio"
                        name = "bio"
                        value={bioText}
                        onChange={(e)=>handleBioChange(e)}
                        maxLength={150}
                    >
                    </textarea>

                    <div className={EditProfileCSS.submitBioWrap}>
                        <p className={bioSize >= 130 ? EditProfileCSS.charLimit : ""}>{bioSize}/150</p>
                        <button className={EditProfileCSS.submitBio} onClick={addBio}>Submit</button>
                        
                    </div>
                </div>
                )}
                <div className={EditProfileCSS.linkButtonWrapper}>
                    <h2 className={EditProfileCSS.editLinkTitle}>Edit Link</h2>
                    
                    <div className={EditProfileCSS.anotherLinkButtonWrap}>
                        <div className={EditProfileCSS.clickButton} onClick={()=>setTheLink(!theLink)}>+</div>
                        <div className={EditProfileCSS.clickButton} onClick={()=>setTheRemoveLink(!theRemoveLink)}>-</div>
                    </div>
                </div>
                {theLink && (<div ref={linkRef} className={EditProfileCSS.makeAbsolute2}>
                    <div className={EditProfileCSS.exit} onClick={()=>setTheLink(!theLink)}>x</div>
                
                <input 
                    className={EditProfileCSS.editInput}
                    placeholder='Enter the url. . . ' 
                    value={urlLink}
                    onChange={(e) => checkUrl(e)}
                    maxLength={50}
                />
                <p className={EditProfileCSS.urlError}>{errMsg}</p>
                <div className={EditProfileCSS.buttonWrap}>
                    <button className={EditProfileCSS.addLinkButton} onClick={addLink}>Submit Link</button>
                    
                </div>
                
                </div>
                )}
                
                {theRemoveLink && (
                    <div ref={removeLinkRef} className={EditProfileCSS.makeAbsolute}>
                        <div   className={EditProfileCSS.exit} onClick={()=>setTheRemoveLink(!theRemoveLink)}>x</div>
                        <div ref={linkRef} className={EditProfileCSS.makeAbsolute2}>
                        <button className={EditProfileCSS.deleteLinkButton} onClick={deleteLink}>Remove Link</button>
                        </div>
                    </div>
                )}

            </form>

            <h2 className={EditProfileCSS.imageUploadTitle}>Image Upload</h2>
            
            {theImageUpload && (
            <SetImage></SetImage>
            )}
            <div className={EditProfileCSS.clickButton} onClick={()=>setTheImageUpload(!theImageUpload)}>+</div>
        </div>
    </div>
    </ImageContext.Provider>
  )
}

function SetImage(){
    const [file, setFile] = useState('')
    const { imageState, setImageState } = useContext(ImageContext)
    const { theImageUpload, setTheImageUpload } = useContext(ImageContext)
    
    let imageUploadRef = useRef();

    const handleImage = (e) =>{
        console.log(e.target.files[0])
        setFile(e.target.files[0])
    }

    //http://3.143.203.151:3001/

    const handleApi = () => {
        const formData = new FormData()
        formData.append('image', file)
        //console.log(formData);
        axios.post(process.env.REACT_APP_HTTP_REQ+'/upload', formData, {
        //axios.post('http://3.20.232.190:3001/upload', formData, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
              },
        })
        .then((res)=>{
            if(res.data.Status==="Image Upload Success"){
                alert("File Upload Succeeded")
                setImageState(true);
            }else{
                alert("File Upload Failed")
            }
        })
        .catch(err=>console.log(err));
    }


    useEffect(()=>{ 
        let theImageHandler = (e)=>{
          //console.log(menuRef.current.contains(e.target))
          if(!imageUploadRef.current?.contains(e.target) ){ //? allows it to work in / and /signup
              setTheImageUpload(false);
      
              
          }
        }
        document.addEventListener("mousedown", theImageHandler);
        return()=>{
          document.removeEventListener("mousedown", theImageHandler);
        }
       })

    return(
        <div ref={imageUploadRef} className={EditProfileCSS.uploadWrapper}>
            <div className={EditProfileCSS.exit} onClick={()=>setTheImageUpload(!theImageUpload)}>x</div>
            <div className={EditProfileCSS.upload}>
                
                <input type="file" name="file"
                    onChange={handleImage}
                ></input>
                
            </div>
            <button className={EditProfileCSS.uploadButton} onClick={handleApi}>Submit File</button>
        </div>
    )
}


export default EditProfile