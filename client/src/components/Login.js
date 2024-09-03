import React, { useState, useContext, useRef, useEffect } from 'react'
import axios from "axios"
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../helpers/AuthContext'
import LoginCSS from '../styles/Login.module.css';


function Login() {
 const history=useNavigate();

 const userRef = useRef(); //to focus in on username
 const [email, setEmail]=useState('')
 const [password, setPassword]=useState('')
 const {setAuthState} = useContext(AuthContext)

 useEffect(() => {
    userRef.current.focus(); //obtained off first render of signup page
  }, [])

 async function submit(e){
   e.preventDefault();
   try{
       await axios.post("http://localhost:3001/login", {
           email,password
       })
       .then(res=>{
           if(res.data.error==="User dosen't exist"){
               alert(res.data.error);
           }
           else if(res.data.error==="wrong username and password combination"){
            alert(res.data.error);
           }
           else{
               localStorage.setItem("accessToken", res.data.token);
               setAuthState({username: res.data.username, id:res.data.id, email:res.data.email, status: true})
               history("/postings");
           }
       })
       .catch(e=>{
           alert("Wrong details")
           console.log(e);
       })
   }catch(e){
       console.log(e);
   }
 }


 return (
   <>
   <div className="bgImg">
       <div className="loginWrapper">
           <h1>Login</h1>
           <form action="#">
               <div className="loginField">
                   <input ref={userRef} type="email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email" required/>
                  
               </div>
               <div className="loginField">
                   <input type="password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" required/>
                  
               </div>
               <button type="submit"onClick={submit}>Sign In</button>
               <p>No Account? <Link to="/signup">Sign Up Now</Link></p>   
           </form>       
       </div>
   </div>
   </>
 )
}


export default Login
