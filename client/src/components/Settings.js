import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SettingsCSS from '../styles/Settings.module.css'; 



function Settings() {
let location = useNavigate()
 const [oldPassword, setOldPassword] = useState("");
 const [newPassword, setNewPassword] = useState("");

 const [dialog, setDialog] = useState({
  message:'',
  isLoading: false,
})


 const changePassword = () => {
  setDialog({message:'Are you sure you want to change password?', isLoading:true})
   axios.put("http://localhost:3001/changepassword", {
  //axios.put("http://3.143.203.151:3001/changepassword", {
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
  
  /*
    axios.delete("http://localhost:3001/deleteAccount", {
    //axios.delete("http://3.143.203.151:3001/deleteAccount", {
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

  */
};

const deleteDialog = () => {
  setDialog({message:'Are you sure you want to delete account?', isLoading:true})

}

const confirmDeleteAccount = (choose) => {
  if(choose){
    setDialog({message:'', isLoading:true})
  }else{
    setDialog({message:'', isLoading:false})
  }

}


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
     { dialog.isLoading && <Dialog onDialog={confirmDeleteAccount} message={dialog.message}/> }
   </div>
 );
}


function Dialog({message, onDialog}){

  return(
    <div className={SettingsCSS.dialogBox}> 
      <div className={SettingsCSS.innerDialogBox}>
        <h3>{message}</h3>
        <div className={SettingsCSS.btnContainer}>
          <button onClick={()=>onDialog(true)} className={SettingsCSS.yes}>Yes</button>
          <button onClick={()=>onDialog(false)} className={SettingsCSS.no}>No</button>
        </div>

      </div>

    </div>
  )
}


export default Settings;


