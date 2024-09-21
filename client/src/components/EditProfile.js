import React, { useContext, useEffect, useState } from 'react'
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

    

  return (
    <ImageContext.Provider value={{ imageState, setImageState }}>
    <div className={EditProfileCSS.editProfile}>
        <h2>Edit Bio</h2>
        <div className={EditProfileCSS.editBio}>
            <form>
                {bioSize == 150 ? <p className={EditProfileCSS.charLimit}>Character Limit Reached</p> : <p className={EditProfileCSS.hidden}>""</p>}
                <textarea
                    placeholder="..."
                    id = "bio"
                    name = "bio"
                    value={bioText}
                    onChange={(e)=>handleBioChange(e)}
                    maxLength={150}
                >
                </textarea>
                <p className={bioSize >= 130 ? EditProfileCSS.charLimit : ""}>{bioSize}/150</p>
                <input placeholder='the url' 
                    value={urlLink}
                    onChange={(e) => checkUrl(e)}
                />
                <p className={EditProfileCSS.urlError}>{errMsg}</p>
                <button onClick={addLink}>Submit Link</button>
                <button onClick={deleteLink}>Delete Link</button>
            </form>
            <button onClick={addBio}>Submit</button>
            <SetImage></SetImage>

        </div>
        
    </div>
    </ImageContext.Provider>
  )
}

function SetImage(){
    const [file, setFile] = useState('')
    const { imageState, setImageState } = useContext(ImageContext)
   

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

    return(
        <div className={EditProfileCSS.upload}>
            <h2>Image Upload</h2>
            <input type="file" name="file"
                onChange={handleImage}
            ></input>
            <button onClick={handleApi}>Submit File</button>
        </div>
    )
}


export default EditProfile