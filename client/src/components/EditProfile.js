import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { DropdownContext } from "../helpers/DropdownContext";
import { ScreenContext } from '../helpers/ScreenContext';
import { SuggestionsContext } from "../helpers/SuggestionsContext";

function EditProfile() {
    let navigate = useNavigate();
    const [bioText, setBioText] = useState('');
    const { authState } = useContext(AuthContext);
    const { arrowState, setArrowState } = useContext(ScreenContext);
    const { dropdownState, setDropdownState } = useContext(DropdownContext);
    const { suggestionsState, setSuggestionsContext } = useContext(SuggestionsContext);
    const [ bioSize, setBioSize] = useState(0);
    const [ imgData, setImgData ] = useState([])
    useEffect(()=>{
        if (!localStorage.getItem("accessToken"))
            navigate("/");
    },[])


    useEffect(()=>{
        axios.get(`http://localhost:3001/getAvatar/${authState.id}`)
        .then(res=>setImgData(res.data[0]))
        .catch(err=>console.log(err))
    },[])


    const addBio = () => {
        axios.post("http://localhost:3001/addBio",{
            bioText
        },{
            headers: {accessToken: localStorage.getItem("accessToken")}
        }).then((err,response)=>{
            if (err) throw new Error;
            console.log(response)
        })
    }

    const handleBioChange = (e) => {
        setBioSize(e.target.value.length);
        setBioText(e.target.value);
    }

    

  return (
    <div className='editProfile'>
        
        <h1>Edit Bio</h1>
        
        <form>
            {bioSize == 200 ? <p>Character Limit Reached</p> : ""}
            <textarea
                placeholder="..."
                id = "bio"
                name = "bio"
                onChange={(e)=>handleBioChange(e)}
                maxLength={200}
            >
            </textarea>
            <p>{bioSize}/200</p>
        </form>
        <button onClick={addBio}>Submit</button>
        <SetImage></SetImage>
    </div>
  )
}

function SetImage(){
    const [file, setFile] = useState('')

    const handleImage = (e) =>{
        console.log(e.target.files[0])
        setFile(e.target.files[0])
    }

    const handleApi = () => {
        const formData = new FormData()
        formData.append('image', file)
        //console.log(formData);
        axios.post('http://localhost:3001/upload', formData, {
            headers: {
                accessToken: localStorage.getItem("accessToken"),
              },
        })
        .then((res)=>{
            if(res.data.Status==="Image Upload Success"){
                console.log("Succeeded")
            }else{
                console.log("Failed")
            }
        })
        .catch(err=>console.log(err));
    }

    return(
        <>
            <h1>Image Upload</h1>
            <div>
                <input type="file" name="file"
                onChange={handleImage}
                ></input>
                <button onClick={handleApi}>Submit File</button>
            </div>
        </>
    )
}


export default EditProfile