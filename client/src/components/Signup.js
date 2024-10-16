import React, {useEffect, useRef, useState, useId, useContext} from 'react'
import axios from "axios"
import { useNavigate, Link } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthContext } from '../helpers/AuthContext'
import SignupCSS from '../styles/Signup.module.css';

function Signup() {
 const history=useNavigate();
 const {setAuthState} = useContext(AuthContext)//contains user details


 const userRef = useRef(); //to focus in on username
 const errRef = useRef();
 const userExistRef = useRef(); //set if user exists 

 /*
 const [user, setUser] = useState(''); //was for username 
 const [validName, setValidName] = useState(false);
 const [userFocus, setUserFocus] = useState(false);
 */

 const [pwd, setPwd] = useState('');
 const [validPwd, setValidPwd] = useState(false);
 const [pwdFocus, setPwdFocus] = useState(false);
 const [matchPwd, setMatchPwd] = useState('');
 const [validMatch, setValidMatch] = useState(false);
 const [matchFocus, setMatchFocus] = useState(false);

 const [errMsg, setErrMsg] = useState('');

 const [userExists, setUserExists] = useState('');

 const [email, setEmail]=useState('');
 const [validEmail, setValidEmail] = useState(false);
 const [emailFocus, setEmailFocus] = useState(false);


 const [fname, setFname] = useState('');
 const [validFname, setValidFname] = useState(false);
 const [fnameFocus, setFnameFocus] = useState(false)

 const [lname, setLname] = useState('');
 const [validLname, setValidLname] = useState(false);
 const [lnameFocus, setLnameFocus] = useState(false);

 const [FNErrMsg, setFNErrMsg] = useState('')
 const [LNErrMsg, setLSErrMsg] = useState('')
 const [EmailErrMsg, setTheEmailErrMsg] = useState('')
 const [PwdErrMsg, setPwdErrMsg] = useState('')
 const [PwdMatchErrMsg, setPwdMatchErrMsg] = useState('')


 //const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
 const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{1,28}$/;
 //const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{1,28}$/;
 //const PWD_REGEX= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]*[!@#$%]{8,}$/
 const PWD_REGEX=/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\w~@#$%^&*+=`|{}:;!.?\"()\[\]-]{8,25}$/;
 const EMAIL_REGEX = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;


 useEffect(() => {
   userRef.current.focus(); //obtained off first render of signup page
 }, [])

 useEffect(() => {
    const result = USER_REGEX.test(fname);
    setValidFname(result); //element now true
  }, [fname]) //only run this when user state changed

  const setFirstName = (e) => {
    setFname(e.target.value);
  }

  useEffect(() => {
    const result = USER_REGEX.test(lname);
    setValidLname(result); //element now true
  }, [lname]) //only run this when user state changed

  const setLastName = (e) => {
    setLname(e.target.value);
  }


 useEffect(() => {
   const result = PWD_REGEX.test(pwd);
   setValidPwd(result); //password is true
   if (matchPwd != ''){
        if(pwd === matchPwd){
            setValidMatch(true)
        }
   }
  
 }, [pwd, matchPwd])

 const setThePwd = (e) => {
    setPwd(e.target.value);
  }


 useEffect(() => {
   const result = EMAIL_REGEX.test(email);
   setValidEmail(result); //password is true
 }, [email])

 const setTheEmail = (e) => {
    setEmail(e.target.value);
  }

const setTheMatchPwd = (e) => {
    setMatchPwd(e.target.value)
    const match = pwd === e.target.value;
    setValidMatch(match);
}

 useEffect(() => {
   setErrMsg('');
   setUserExists(''); //do this to reinitiliaze after new render
 }, [fname, lname, pwd, matchPwd, email])


 const handleSubmit = async (e) => {
   e.preventDefault();
   
   //something to do with preventing attack
   const v1 = USER_REGEX.test(fname);
   if(!v1){
    setFNErrMsg('2-29 characters. Start with a letter. At least one number. _, - allowed.')
   }
   const v2 = USER_REGEX.test(lname);
   if(!v2){
    setLSErrMsg('2-29 characters. Start with a letter. At least one number. _, - allowed.')
   }
   const v3 = EMAIL_REGEX.test(email);
   if(!v3){
    setTheEmailErrMsg('Enter a valid email');
   }
   const v4 = PWD_REGEX.test(pwd);
   if(!v4){
    setPwdErrMsg('At least 8 characters. Must include uppercase and lowercase letters, and a number.')
   }
   if(!validMatch){
    setPwdMatchErrMsg('Must match password above.')

   }
   if(!v1 || !v2 | !v3 | !v4 | !validMatch){
    return;
   }
   try{
       await axios.post(process.env.REACT_APP_HTTP_REQ+"/signupFour", {
       //await axios.post("http://3.20.232.190:3001/signupFour", {
        fname, lname, pwd, email
       })
       .then(res=>{
        if(res.data.error){
            setUserExists(res.data.error); 
        }
        else{ //authorize user 
            localStorage.setItem("accessToken", res.data.token);
            setAuthState({firstname: res.data.firstname, lastname:res.data.lastname, id:res.data.id, email:res.data.email, status: true})
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
    <div className={SignupCSS.backgroundImg}>
        <div className={SignupCSS.signupWrapper}>
            <p ref={errRef} className={errMsg ? SignupCSS.errmsg : 
                SignupCSS.offscreen} aria-live="assertive">{errMsg}
            </p>
            <h1>Sign Up</h1>
            <form action="#" onSubmit={handleSubmit} autoComplete="off">
                <p ref={userExistRef} className={userExists ? SignupCSS.errmsg :
                    SignupCSS.offscreen} aria-live="assertive">{userExists}
                </p>
                <div className={SignupCSS.signupField}>
                    <label htmlFor='firstname'>
                        <span className={validFname ? SignupCSS.valid : SignupCSS.offscreen}>
                            <i className="bi bi-check"></i>
                        </span>
                        <span className={validFname || !fname ? SignupCSS.hide:SignupCSS.invalid }>
                            <i className="bi bi-x"></i>
                        </span>
                    </label>
                    <input
                        type="text"
                        id="firstname"
                        placeholder='First Name'
                        ref={userRef} //used to obtain this element upon 1st render
                        //onChange={(e) => setFname(e.target.value)}
                        onChange={(e) => setFirstName(e)}
                        required
                        aria-invalid={validFname ? "false" : "true"}
                        aria-describedby='uidnote'
                        autoComplete="off"
                        maxLength={15}
                        onFocus={() => setFnameFocus(true)}
                        onBlur={() => setFnameFocus(false)}
                    />   
                    <p className={SignupCSS.theErrors}>
                    
                    {FNErrMsg}
                    </p>
                </div>
                {/*<p id="uidnote" className={fnameFocus && fname &&
                    !validFname ? SignupCSS.instructions : SignupCSS.offscreen}>
                    <i class="bi bi-x-circle"></i>
                */}
                
                <div className={SignupCSS.signupField}>
                    <label htmlFor='username'>
                        <span className={validLname ? SignupCSS.valid : SignupCSS.hide}>
                            <i className="bi bi-check"></i>
                        </span>
                        <span className={validLname || !lname ? SignupCSS.hide:SignupCSS.valid}>
                            <i className="bi bi-x"></i>
                        </span>
                    </label>
                    <input
                        type="text"
                        id="lastname"
                        placeholder='Last Name'
                        //ref={userRef} //used to obtain this element upon 1st render
                        onChange={(e) => setLname(e.target.value)}
                        required
                        aria-invalid={validFname ? "false" : "true"}
                        aria-describedby='uidnote'
                        autoComplete="off"
                        maxLength={15}
                        onFocus={() => setLnameFocus(true)}
                        onBlur={() => setLnameFocus(false)}
                    />   
                    <p className={SignupCSS.theErrors}>{LNErrMsg}
                    </p>
                </div>
                <div className={SignupCSS.signupField}>
                    <label htmlFor='email'>
                        <span className={validEmail ? SignupCSS.valid : SignupCSS.hide}>
                            <i className="bi bi-check"></i>
                        </span>
                        <span className={validEmail || !email ? SignupCSS.hide :
                            SignupCSS.invalid}>
                            <i className="bi bi-x"></i>
                        </span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder='Email'
                        //onChange={(e) => setEmail(e.target.value)}
                        onChange={(e) => setTheEmail(e)}
                        required
                        aria-invalid={validEmail ? "false" : "true"}
                        aria-describedby='emailnote'
                        autoComplete="off"
                        maxLength={30}
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                    />
                    <p className={SignupCSS.theErrors}>{EmailErrMsg}
                    </p>
                              
                </div>
                    <div className={SignupCSS.signupField}>
                        <label htmlFor='password'>
                            <span className={validPwd ? SignupCSS.valid : SignupCSS.hide}>
                                <i className="bi bi-check"></i>
                            </span>
                            <span className={validPwd || !pwd ? SignupCSS.hide :
                                   SignupCSS.invalid}>
                                <i className="bi bi-x"></i>
                            </span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder='Password'
                            //onChange={(e) => setPwd(e.target.value)}
                            onChange={(e) => setThePwd(e)}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby='pwdnote'
                            autoComplete="current-password"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />  
                         <p className={SignupCSS.theErrors}>{PwdErrMsg}
                         </p>     
                    </div>

                   
                    <div className={SignupCSS.signupField}>
                        <label htmlFor='confirm_pwd'>
                            <span className={validMatch && pwd.length > 0 && matchPwd.length > 0 ? SignupCSS.valid : SignupCSS.hide}>
                                <i className="bi bi-check"></i>
                            </span>
                            <span className={!validMatch && pwd.length > 0 && matchPwd.length > 0 ?  SignupCSS.invalid:
                                SignupCSS.hide}>
                                <i className="bi bi-x"></i>
                            </span>
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            placeholder='Confirm Password'
                            //onChange={(e) => setMatchPwd(e.target.value)}
                            onChange={(e) => setTheMatchPwd(e)}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby='confirmnote'
                            autoComplete="current-password"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />  
                        <p className={SignupCSS.theErrors}>{PwdMatchErrMsg}
                        </p>        
                    </div>
   
                    
                    <div className={SignupCSS.signupField}>
                        <input
                            className={SignupCSS.signupButton}
                            //disabled={!validFname || !validLname || !validEmail || !validPwd || !validMatch ? true : false}
                            type="submit"
                            value="Submit" 
                        />
                    </div>
                    <p>Already have an account? <Link to="/">Login</Link></p>
            </form>
        </div>
    </div>
 )
}





export default Signup
