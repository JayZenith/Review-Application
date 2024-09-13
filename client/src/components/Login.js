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
 const userExistsRef = useRef(); //set if user exists 
 const [userExists, setUserExists] = useState('');

 useEffect(() => {
    userRef.current.focus(); //obtained off first render of signup page
  }, [])

  useEffect(() => {
    setUserExists(''); //do this to reinitiliaze after new render
  }, [email, password])
 

 async function submit(e){
   e.preventDefault();
   try{
       await axios.post("http://localhost:3001/login", {
       //await axios.post("http://3.143.203.151:3001/login", {
           email,password
       })
       .then(res=>{
           if(res.data.error==="User dosen't exist"){
            setUserExists(res.data.error);
           }
           else if(res.data.error==="wrong username and password combination"){
            setUserExists(res.data.error);
           }
           else{
            localStorage.setItem("accessToken", res.data.token);
            setAuthState({username: res.data.username, id:res.data.id, email:res.data.email, status: true})
            history("/postings");
           }
       })
       .catch(e=>{
           setUserExists("Wrong details");
           //console.log(e);
       })
   }catch(e){
        //console.log(e);
   }
 }


 return (
   <div className={LoginCSS.backgroundImg}>
       <div className={LoginCSS.loginWrapper}>
           <h1>Login</h1>
           <p ref={userExistsRef} className={userExists ? LoginCSS.errmsg :
                LoginCSS.offscreen} aria-live="assertive">{userExists}
            </p>
           <form action="#">
               <div className={LoginCSS.loginField}>
                   <input ref={userRef} type="email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email" required/>  
               </div>
               <div className={LoginCSS.loginField}>
                   <input type="password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password" required/> 
               </div>
               <button type="submit"onClick={submit}>Sign In</button>
               <p>No Account? <Link to="/signup">Sign Up Now</Link></p>   
           </form>       
       </div>
   </div>
 )
}


export default Login
