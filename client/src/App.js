import './index.css';
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link, BrowserRouter } from "react-router-dom";
import React, { useState, useEffect, useRef, useContext } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useNavigate } from "react-router-dom";

//Contexts
import { AuthContext } from "./helpers/AuthContext";
import { SuggestionsContext } from "./helpers/SuggestionsContext";
import { ScreenContext } from "./helpers/ScreenContext";
import { DropdownContext } from "./helpers/DropdownContext";
import { ImageContext } from "./helpers/ImageContext";
import { RenderContext } from "./helpers/RenderContext";

//SVGs
import { ReactComponent as DownIcon } from './icons/down.svg';
import { ReactComponent as HomeIcon } from './icons/home.svg';
import { ReactComponent as LogoutIcon } from './icons/logout.svg';
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as SettingsIcon } from './icons/settings.svg';
import { ReactComponent as UndefinedIcon } from './icons/undefined.svg';
import { ReactComponent as UpIcon } from './icons/up.svg';

import starIcon from './icons/starMe.svg'
import home from './icons/newhome.svg';
import downicon from './icons/down.svg';

//Components
import Login from './components/Login';
import Postings from './components/Postings';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Signup from './components/Signup';
import ClipLoader from "react-spinners/ClipLoader";
import SinglePost from './components/SinglePost';
import EditProfile from './components/EditProfile';
import PageNotFound from './components/PageNotFound';
import { FaStar } from 'react-icons/fa'

function App() {
 let location = useNavigate()
 const [loading, isLoading]=useState(false)
 const [authState, setAuthState] = useState({ // state of user
   username: "",
   id: 0,
   status: false, // not authorized
 });

 const [suggestionsState, setSuggestionsContext] = useState([]); //search suggestions 
 const [arrowState, setArrowState] = useState(false) //Arrow toggle 
 const [dropdownState, setDropdownState] = useState(false) //Dropdown toggle
 const [imageState, setImageState] = useState(false) //
 const [render, setRenderState] = useState(false) //
 const [topusers, setTopUsers] = useState([])
  const [starMe, setStarMe] = useState(false);

 /*
 const [burger_class, setBurgerClass] = useState("burger-bar clicked")
 const [menu_class, setMenuClass] = useState("menu hidden")
 const [isMenuClicked, setIsMenuClicked] = useState(false)
 */

 const [openSettings, setOpenSettings] = useState(false)
 let menuRef = useRef();

 let spotlightRef = useRef();

 useEffect(()=>{ //Check for acccessToken
  if (!localStorage.getItem("accessToken")){
    if(!window.location.pathname==="/signup"){
      location("/"); //if not go to login
    }
    //if user refrshes at /signup then they can stay there 
    }
  }, []);
 
 useEffect(()=>{ 
  let handler = (e)=>{
    //console.log(menuRef.current.contains(e.target))
    if(!menuRef.current?.contains(e.target)){ //? allows it to work in / and /signup
        setOpenSettings(false);
    }
  }
  document.addEventListener("mousedown", handler);
  return()=>{
    document.removeEventListener("mousedown", handler);
  }
 })

 useEffect(()=>{ 
  let spotlightHandler = (e)=>{
    //console.log(menuRef.current.contains(e.target))
    if(!spotlightRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)){ //? allows it to work in / and /signup
        setStarMe(false);

        
    }
  }
  document.addEventListener("mousedown", spotlightHandler);
  return()=>{
    document.removeEventListener("mousedown", spotlightHandler);
  }
 })
  
 
useEffect(() => { //renders on any page load
  isLoading(true); 
  axios
    //.get("http://localhost:3001/auth", {
    .get("http://3.20.232.190:3001/auth", {
      headers: {
        accessToken: localStorage.getItem("accessToken"), //validate the token
      },
    })
    .then((res) => {
      if (res.data.error) { //if theres an error then user not authorized
        setAuthState({ ...authState, status: false });
      } else {      
        setAuthState({ //can also use res.data.email
          firstname: res.data.firstname,
          lastname: res.data.lastname,
          email: res.data.email,
          id: res.data.id,
          status: true,
        });
        //if im at login or sign up while logged in, redirect to home
        if (window.location.pathname === "/" ||
           window.location.pathname === "/signup"
           ){
           location("/postings")
          }
      }
      isLoading(false); //when retrieved auth state 
     });
  }, []);

  useEffect(()=>{
    //axios.get("http://localhost:3001/topusers", {
    axios.get("http://3.20.232.190:3001/topusers", {
    }).then((response) => {
    setTimeout(()=>{
      setTopUsers(response.data.filter((item)=>{
        return item.id != null;
      }))
      
      //console.log(response.data[0].id);

    },20)
    setRenderState(false);
    });
  }, [render])

  console.log(topusers)
  /*
  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
    location("/"); //login page
  }
  */
  const arrowClicked =(value)=>{ //takes care of Logout, Settings, Edit 
    if(value === "Logout"){
      localStorage.removeItem("accessToken");
      setAuthState({ username: "", id: 0, status: false });
      location("/"); //login page
    }
    else if(value ==="Settings"){
      location(`/settings/${authState.id}`);
    }
    else if(value ==="Edit"){
      location(`/profile/editProfile/`);
    }
  }

  return ( //AppX is not defined
    <div className={loading ? 'App' : 'AppX'}>
     { 
       loading ? //if loading, show loader
       <ClipLoader color={"#DC143C"} loading={loading} size={100} aria-label="Loading Spinner" data-testid="loader"
       />
       : //else show navbar 
        <AuthContext.Provider value={{ authState, setAuthState }}>
        <SuggestionsContext.Provider value={{ suggestionsState, setSuggestionsContext }}>
        <ScreenContext.Provider value={{ arrowState, setArrowState }}>
        <DropdownContext.Provider value={{ dropdownState, setDropdownState }}>
        <ImageContext.Provider value={{ imageState, setImageState }}>
        <RenderContext.Provider value={{render, setRenderState }}>
        {authState.status ? (  <>
        <nav className="navbar" ref={menuRef}>


        <ul className="navbar-nav">
            <div key="0" className='navWrap'>
              <li key="1" className="home">
                <a key="1.5" href="/postings">
                 <div key="1.6" className='navicon'><img src={home} alt={"home"} width="30" height="30"/> </div>
                </a>
              </li>
              <li key="2" className="profilePic">
                <a key="2.1" href={`/profile/${authState.id}`}><ProfileImage /></a>
              </li>
              <li key="2" className="starMeButton">
          
                <div key="1.6" onClick={()=>setStarMe(!starMe)} className='navicon staricon'><img src={starIcon} alt={"home"} width="40" height="40"/> </div>
              </li>
            </div>
            
            
            <li key="3" className="arrow" onClick={()=>setOpenSettings(!openSettings) }     
              >
               <div key="3.1" className='navicon'><img src={downicon} alt={"arrow"} width="30" height="30"/> </div>   
            </li>
            <SearchBar key="3.4" />
            <div key="3.5" className={openSettings ? 'dropDownSettings' : 'dropDownHidden'} >
                <ul key="3.6" className='theUL'>
                  <li key="4" onClick={()=>arrowClicked("Edit")}>Edit Profile</li>
                  <li key="5" onClick={()=>arrowClicked("Settings")}>Settings</li>
                  <li key="6" onClick={()=>arrowClicked("Logout")}>Logout</li>
                </ul>
            </div>
          </ul>
        </nav>

        {starMe && (
        <div className="starMeSpotlight" >
          <div className="innerSpotlight" ref={spotlightRef}>
            <h2>Most Reviews Today</h2>
            <div className="topUsers">
            
              {topusers.slice(0, 3).map((item, i) => {
                return(
                  <div className="topuserWrap" 
                  onClick={()=> {
                    location(`/profile/${item.id}`);
                    window.location.reload()
                  }}
                  >
                    <div className="avatar"
                    
                    >
                      {/*<img className="imgAvatar" src={`http://localhost:3001/images/`+item.ImageData} alt="img" />*/}
                      <img className="imgAvatar" src={`http://3.20.232.190:3001/images/`+item.ImageData} alt="img" />
                    </div>
                    <p>{item.fullname}</p>
                    {/*<StarRating>{item.theavg}</StarRating>*/}
                  </div>
                )
            
              })}
            </div>
          </div>
        </div>
 
        )}


        
          </>
          ) : ( //Figure out 
            <>
              {/*Login/Signup Page*/}
            </>
          )}

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/postings" element={<Postings />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/Settings/:id" element={<Settings />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/singlePost/:id" element={<SinglePost />} />
            <Route path="/profile/editProfile" element={<EditProfile />} />
            {/*<Route path="*" element={<PageNotFound/>} />*/}
          </Routes>
          </RenderContext.Provider>
          </ImageContext.Provider>
          </DropdownContext.Provider>
          </ScreenContext.Provider>
          </SuggestionsContext.Provider>
          </AuthContext.Provider>
      }
    </div>
 );
}


function SearchBar(){
  let location = useNavigate()
  const [users, setUsers] = useState([])
  const [suggestionsState, setSuggestionsContext] = useState([]); //used for search suggestions
  const [input, setInput] = useState(''); //input in search field
  const [dropdownState, setDropdownState] = useState(false);
  const [render, setRenderState] = useState(false);
  const searchRef = useRef();

  useEffect(() => {
    searchRef.current.focus(); //obtained off first render of signup page
  }, [])
 
 
  useEffect(()=>{ //Load the Users for searching 
    const loadUsers = async () => {
      const response = await axios.get("http://3.20.232.190:3001/users2");
      //const response = await axios.get("http://localhost:3001/users2");
      setUsers(response.data)
    }
    loadUsers();
  }, [])
 
  const onChangeHandler = (text) => { ///Set the suggestions 
    let matches = []
    if (text.length > 0){
       matches = users.filter(user=>{
        try{
          const regex = new RegExp(`^${text}`,"gi");
          if(user.fullname.match(regex)){
            return user.fullname.match(regex);
          }
          else if(user.email.match(regex)){
            return user.email.match(regex);
          }
        }catch(err){
          //console.log(err)
          return;
        }
        //return user.email.match(regex); //search by email
      })
    }
    setSuggestionsContext(matches);//to set useContext hook right away due to lag
    setInput(text) //set search input
  }

 /*
  const userSearch = () => {
    location(`/userSearch`);
  }
  const handleKeyUp = (e) => { //dont need as we dont load results on sep page
    if(e.key === "Enter"){
      userSearch();
    }
  }
  */

  const dropState = (state) => {
    setTimeout(()=>{
      setDropdownState(state)
    },"100");
    //console.log(dropdownState);
  }
 
  return(
    <div className='searchBarWrap'>
      <div className='searchBar'>
        <input 
          className='specify'
          placeholder='Search Users By Name or Email...'
          value={input}
          onChange={(e)=>{onChangeHandler(e.target.value);}}
          onFocusCapture={() => dropState(true)}
          ref={searchRef}
          onBlurCapture={() => dropState(false)}
        />
      </div>
      <div className={!dropdownState ? "userSearchDropdownHidden" : "userSearchDropdown"}>
        {suggestionsState && suggestionsState.map((userData, idx) => {
          return(
            <div key ={idx} className="userSearchDivs"
              onClick={() => {
                location(`/profile/${userData.id}`);
                window.location.reload()
              }}
            >
              <div key={idx} className="avatar">
                {userData.ImageData ?
                  <img className='imgAvatar' src={`http://3.20.232.190:3001/images/`+userData.ImageData} width="200" height="100" alt="" />
                  //<img key={idx} className='imgAvatar' src={`http://localhost:3001/images/`+userData.ImageData} width="200" height="100" alt="" />
                  : <></>
                }
              </div>
              <p key={idx} className='userSearchNames'>{userData.firstname+ " " +userData.lastname}</p>
            </div> 
          )
        })}
      </div> {/*END user-search-results*/}
    </div>
  );
 }


 function ProfileImage(){
  const[imgData, setImgData] = useState([])
  const { authState, setAuthState } = useContext(AuthContext);
  const { imageState, setImageState } = useContext(ImageContext);


  useEffect(()=>{ //authState.id to show self 
    //axios.get(`http://localhost:3001/getAvatar/${authState.id}`)
    axios.get(`http://3.20.232.190:3001/getAvatar/${authState.id}`)
    .then(res=>setImgData(res.data[0]))
    .catch(err=>console.log(err))
  },[imageState]) //need to render image instantly

  return(
    <AuthContext.Provider value={{ authState, setAuthState }}>
    <ImageContext.Provider value={{ imageState, setImageState }}>
      {imgData?
      //<img className='imgAvatar' src={`http://localhost:3001/images/`+imgData.ImageData} width="200" height="100" alt="" />
      <img className='imgAvatar' src={`http://3.20.232.190:3001/images/`+imgData.ImageData} width="200" height="100" alt="" />
      //<></>
      :
      <></>
      }
    </ImageContext.Provider>
    </AuthContext.Provider>
  );
 }

 function StarRating(props){
 
  const [hover, setHover] = useState(null)

  return(
  <div className='starRating'>
                {[...Array(5)].map((star, idx)=>{
                const currentRate = idx + 1;
                //val.rating is key here 
                return(
                    <>
                        <label>
                        <input className="radioBtn" type="radio" name="rating"  
                            value={currentRate}  
                        />
                            <FaStar className='ratingStar' size={20}
                                color={currentRate <= (hover || props.children) ? 
                                    "red"
                                    : "white"
                                }
                                //onMouseEnter={()=>setHover(currentRate)}
                                //onMouseLeave={()=>setHover(null)}
                            />
                        </label>
                        </>  
                    )
                })}
    </div>
  );
  
}
 
 
 export default App;
 
