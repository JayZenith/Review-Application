import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SettingsCSS from '../styles/Settings.module.css'; 



function Settings() {
let location = useNavigate()
 const [oldPassword, setOldPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");


 const changePassword = () => {
   axios.put("http://localhost:3001/changepassword", {
       oldPassword: oldPassword,
       newPassword: newPassword,
     }, {
       headers: {
         accessToken: localStorage.getItem("accessToken"),
       },
     }
   ).then((response) => {
     if(response.data.error){
       alert(response.data.error);
     }

   })
 };

 const deleteAccount = () => {
  axios.delete("http://localhost:3001/deleteAccount", {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    }
  ).then((response) => {
    if(response.data.error){
      alert(response.data.error);
    }
    localStorage.removeItem("accessToken");
    //setAuthState({ username: "", id: 0, status: false });
    location("/"); //login page


  })
};




 return (
   <div className={SettingsCSS.settings}>
     <h1>Change Your Password</h1>
     <input
       type="text"
       placeholder="Old Password..."
       onChange={(event)=>{
         setOldPassword(event.target.value);
       }}
     />
     <input
       type="text"
       placeholder="New Password..."
       onChange={(event)=>{
         setNewPassword(event.target.value);
       }}
     />
     <button onClick={changePassword}>Save Changes</button>


     <div className="deleteAccount">
       <h1>Delete Account</h1>
       <button onClick={deleteAccount}>Delete Account</button>

     </div>
   </div>
 );
}


export default Settings;


