import React, { useState, useContext } from 'react'
import axios from "axios"
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../helpers/AuthContext'


function Login() {
 const history=useNavigate();


 const [email, setEmail]=useState('')
 const [password, setPassword]=useState('')
 const {setAuthState} = useContext(AuthContext)


 async function submit(e){
   e.preventDefault();


   try{
       await axios.post("http://localhost:3001/login", {
           email,password
       })
       .then(res=>{
           if(res.data.error){
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
                   <input type="email" onChange={(e)=>{setEmail(e.target.value)}} placeholder="Email" required/>
                   <i className="bi bi-envelope"></i>
               </div>
               <div className="loginField">
                   <input type="password" onChange={(e)=>{setPassword(e.target.value)}} placeholder="password" required/>
                   <i className="bi bi-lock"></i>
               </div>
               <button type="submit"onClick={submit}>Sign In</button>
               <div className="formHelp">
                   {/*<div class="rememberMe">
                       <input type="checkbox" id="remember-me"/>
                       <label for="remember-me">Remember me</label>
                   </div>*/}
               </div>
           </form>    
           <p>No Account? <Link to="/signup">Sign Up Now</Link></p>       
       </div>
   </div>
   </>
 )
}


export default Login
