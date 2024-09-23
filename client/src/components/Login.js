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
 const [EmailErrMsg, setEmailErrMsg] = useState('');
 const [PwdErrMsg, setPwdErrMsg] = useState('');

 useEffect(() => {
    userRef.current.focus(); //obtained off first render of signup page
  }, [])

  useEffect(() => {
    setUserExists(''); //do this to reinitiliaze after new render
  }, [email, password])
  

  const setTheEmail = (e) => {
    setEmail(e.target.value);
    setEmailErrMsg('')
  }

  const setThePassword = (e) => {
    setPassword(e.target.value);
    setPwdErrMsg('')
  }
 

 async function submit(e){
   
   e.preventDefault();

   if(email.length === 0){
    setEmailErrMsg('Enter the email')
    return;
   }
   else if(password.length === 0){
    setPwdErrMsg('Enter the password')
    return;
   }

   try{
       await axios.post(process.env.REACT_APP_HTTP_REQ+"/login", {
       //await axios.post("http://3.20.232.190:3001/login", {
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
                   <input ref={userRef} type="email" onChange={(e)=>{setTheEmail(e)}} placeholder="Email" required/>  
                   <p className={LoginCSS.theErrors}>{EmailErrMsg}
                    </p>
               </div>
               <div className={LoginCSS.loginField}>
                   <input type="password" onChange={(e)=>{setThePassword(e)}} placeholder="Password" required/> 
                   <p className={LoginCSS.theErrors}>{PwdErrMsg}
                    </p>
               </div>
               <button type="submit"onClick={submit}>Sign In</button>
               <p>No Account? <Link to="/signup">Sign Up Now</Link></p>   
           </form>       
       </div>
   </div>
 )
}


export default Login
