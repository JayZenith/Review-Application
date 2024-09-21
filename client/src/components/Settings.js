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
  isLoading2: false, 
})

 const changePassword = () => {
  setDialog({message:'', isLoading: false, isLoading2:false})
  axios.put(process.env.REACT_APP_HTTP_REQ+"/changepassword", {
  //axios.put("http://3.20.232.190:3001/changepassword", {
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
      alert(response.data)
    
     

   })
 };

 const deleteAccount = () => {
    axios.delete(process.env.REACT_APP_HTTP_REQ+"/deleteAccount", {
    //axios.delete("http://3.20.232.190:3001/deleteAccount", {
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



const deleteDialog = () => {
  setDialog({message:'Are you sure you want to delete account?', isLoading:true})

}

const passwordDialog = () => {
  setDialog({message:'Are you sure you want to change password?', isLoading2:true})
}


const confirmChangePassword = (decision)=>{
  if(decision){
    changePassword()
  }else{
    setDialog({message:'', isLoading2:false})
  }

}

const confirmDeleteAccount = (choose) => {
  if(choose){
    deleteAccount()
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
     <button onClick={passwordDialog}>Save Changes</button>


     <div className="deleteAccount">
       <h1>Delete Account</h1>
       {/*<button onClick={deleteAccount}>Delete Account</button>*/}
       <button onClick={deleteDialog}>Delete Account</button>

     </div>
     { dialog.isLoading && <Dialog onDialog={confirmDeleteAccount} message={dialog.message}/> }
     { dialog.isLoading2 && <Dialog onDialog={confirmChangePassword} message={dialog.message}/> }
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


