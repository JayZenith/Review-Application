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
 const [fnameFocus, setFnameFocus] = useState(false);

 const [lname, setLname] = useState('');
 const [validLname, setValidLname] = useState(false);
 const [lnameFocus, setLnameFocus] = useState(false);


 //const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
 const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{0,28}$/;
 const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{0,28}$/;
 const EMAIL_REGEX = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;


 useEffect(() => {
   userRef.current.focus(); //obtained off first render of signup page
 }, [])

/*
 useEffect(() => {
   const result = USER_REGEX.test(user);
   setValidName(result); //element now true
 }, [user]) //only run this when user state changed
 */

 useEffect(() => {
    const result = USER_REGEX.test(fname);
    setValidFname(result); //element now true
  }, [fname]) //only run this when user state changed

  useEffect(() => {
    const result = USER_REGEX.test(lname);
    setValidLname(result); //element now true
  }, [lname]) //only run this when user state changed


 useEffect(() => {
   const result = PWD_REGEX.test(pwd);
   setValidPwd(result); //password is true
   const match = pwd === matchPwd;
   setValidMatch(match); //passwords match
 }, [pwd, matchPwd])


 useEffect(() => {
   const result = EMAIL_REGEX.test(email);
   setValidEmail(result); //password is true
 }, [email])


 useEffect(() => {
   setErrMsg('');
   setUserExists(''); //do this to reinitiliaze after new render
 }, [fname, lname, pwd, matchPwd, email])


 const handleSubmit = async (e) => {
   e.preventDefault();
   //something to do with preventing attack
   const v1 = USER_REGEX.test(fname);
   const v2 = USER_REGEX.test(lname);
   const v3 = EMAIL_REGEX.test(email);
   const v4 = PWD_REGEX.test(pwd);
   if(!v1 || !v2 | !v3 | !v4){
    setErrMsg("Invalid Entry");
    return;
   }

   try{
       await axios.post("http://localhost:3001/signupFour", {
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
            <form action="#" onSubmit={handleSubmit}>
                <p ref={userExistRef} className={userExists ? SignupCSS.errmsg :
                    SignupCSS.offscreen} aria-live="assertive">{userExists}
                </p>
                <div className={SignupCSS.signupField}>
                    <label htmlFor='firstname'>
                        <span className={validFname ? SignupCSS.valid : SignupCSS.hide}>
                            <i className="bi bi-check"></i>
                        </span>
                        <span className={validFname || !fname ? SignupCSS.hide:SignupCSS.invalid}>
                            <i className="bi bi-x"></i>
                        </span>
                    </label>
                    <input
                        type="text"
                        id="firstname"
                        placeholder='First Name'
                        ref={userRef} //used to obtain this element upon 1st render
                        onChange={(e) => setFname(e.target.value)}
                        required
                        aria-invalid={validFname ? "false" : "true"}
                        aria-describedby='uidnote'
                        autoComplete = 'new-password'
                        onFocus={() => setFnameFocus(true)}
                        onBlur={() => setFnameFocus(false)}
                    />   
                </div>
                <p id="uidnote" className={fnameFocus && fname &&
                    !validFname ? SignupCSS.instructions : SignupCSS.offscreen}>
                    <i class="bi bi-x-circle"></i>
                        1 to 29 characters.
                        Must begin wtih a letter.
                        Letters, numbers, underscores, hyphens allowed.
                </p>
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
                        autoComplete = 'new-password'
                        onFocus={() => setLnameFocus(true)}
                        onBlur={() => setLnameFocus(false)}
                    />   
                </div>
                <p id="uidnote" className={lnameFocus && lname &&
                    !validLname ? SignupCSS.instructions : SignupCSS.offscreen}>
                    <i class="bi bi-x-circle"></i>
                    1 to 29 characters.
                    Must begin wtih a letter.
                    Letters, numbers, underscores, hyphens allowed.
                </p>
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-invalid={validEmail ? "false" : "true"}
                        aria-describedby='emailnote'
                        autoComplete = 'new-password'
                        onFocus={() => setEmailFocus(true)}
                        onBlur={() => setEmailFocus(false)}
                    />
                              
                </div>
                    <p id="emailnote" className={emailFocus && !validEmail ? SignupCSS.instructions :
                        SignupCSS.offscreen}>
                        <i class="bi bi-x-circle"></i>
                            Enter your e-mail. 
                    </p>
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
                            onChange={(e) => setPwd(e.target.value)}
                            required
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby='pwdnote'
                            autoComplete = 'new-password'
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />       
                    </div>
                    <p id="pwdnote" className={pwdFocus && !validPwd ? SignupCSS.instructions :
                        SignupCSS.offscreen}>
                        <i class="bi bi-x-circle"></i>
                        8 to 24 characters. Must include uppercase and 
                        lowercase letters, a number and one of: <span aria-label="exclamation mark">!</span>
                        <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span>
                        <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                    </p>
                    <div className={SignupCSS.signupField}>
                        <label htmlFor='confirm_pwd'>
                            <span className={validMatch && matchPwd ? SignupCSS.valid : SignupCSS.hide}>
                                <i className="bi bi-check"></i>
                            </span>
                            <span className={validMatch || !matchPwd ?  SignupCSS.hide :
                                SignupCSS.invalid}>
                                <i className="bi bi-x"></i>
                            </span>
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            placeholder='Confirm Password'
                            onChange={(e) => setMatchPwd(e.target.value)}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby='confirmnote'
                            autoComplete = 'new-password'
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />          
                    </div>
                    <p id="confirmnote" className={matchFocus && !validMatch ? SignupCSS.instructions :
                        SignupCSS.offscreen}>
                        <i class="bi bi-x-circle"></i>
                        Must match the first password.
                    </p>
                    <div className={SignupCSS.signupField}>
                        <input
                            className={SignupCSS.signupButton}
                            disabled={!validFname || !validLname || !validEmail || !validPwd || !validMatch ? true : false}
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
