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

//SVGs
import { ReactComponent as DownIcon } from './icons/down.svg';
import { ReactComponent as HomeIcon } from './icons/home.svg';
import { ReactComponent as LogoutIcon } from './icons/logout.svg';
import { ReactComponent as ProfileIcon } from './icons/profile.svg';
import { ReactComponent as SettingsIcon } from './icons/settings.svg';
import { ReactComponent as UndefinedIcon } from './icons/undefined.svg';
import { ReactComponent as UpIcon } from './icons/up.svg';

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

 useEffect(()=>{ //Check for acccessToken
  if (!localStorage.getItem("accessToken")){
    location("/"); //if not go to login
    }
  }, []);
 
useEffect(() => { //renders on any page load
  isLoading(true);
  axios
    .get("http://localhost:3001/auth", {
      headers: {
        accessToken: localStorage.getItem("accessToken"), //validate the token
      },
    })
    .then((res) => {
      if (res.data.error) { //if theres an error then user not authorized
        setAuthState({ ...authState, status: false });
      } else {
        setAuthState({ //can also use res.data.email
          username: res.data.username,
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


  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ username: "", id: 0, status: false });
    location("/"); //login page
  }

  return (
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
    
        {authState.status ? (  //if authenticated 
        
          <Navbar>
                <NavItem icon={<HomeIcon />} item="Home" />
                <NavItem icon={<ProfileIcon />} item="Profile" />
                <SearchBar />
                <NavItem icon={<DownIcon />} item="Arrow">
                  <DropdownMenu></DropdownMenu>
                </NavItem>
          </Navbar>
        
         
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
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownState, setDropdownState] = useState(false);
 
 
  useEffect(()=>{ //Load the Users for searching 
    const loadUsers = async () => {
      const response = await axios.get("http://localhost:3001/users");
      setUsers(response.data)
    }
    loadUsers();
  }, [])
 
 
  const onChangeHandler = (text) => { ///Set the suggestions 
    let matches = []
    if (text.length > 0){
      matches = users.filter(user=>{
        const regex = new RegExp(`^${text}`,"gi");
        return user.username.match(regex);
      })
    }
    //console.log('matches ',matches)
    //setSuggestionsContext(matches)
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
 
  return(
    <>
      <div className='searchBar'>
        <input
          placeholder='Search...'
          valye={input}
          onChange={(e)=>{onChangeHandler(e.target.value);}}
          onFocusCapture={() => setDropdownState(true)}
          //onBlurCapture={() => setDropdownState(false)}
        />
      </div>
      <div className="userSearchDropdown">
        {suggestionsState && suggestionsState.map((userData, idx) => {
          return(
            <div key ={idx} className="userSearchDivs"
              onClick={() => {
                location(`/profile/${userData.id}`);
                window.location.reload()
              }}
            >
              <div className="userSearchAvatar"></div>
              <p>{userData.username}</p>
            </div> 
          )
        })}
      </div> {/*END user-search-results*/}
    </>
  );
 }
 
 
 function Navbar(props) {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">{props.children}</ul>
    </nav>
  );
 }
 
 
 function NavItem(props) {
  let location = useNavigate()
  const [open, setOpen] = useState(false);
  const { authState, setAuthState } = useContext(AuthContext);
 
  return (
     <AuthContext.Provider value={{ authState, setAuthState }}>
      <li
      //onBlurCapture={props.item=="Arrow" ? "" : ""}
      className={props.item=="Search" ? "nav-item offscreentwo" : props.item=="Arrow"?"arrowToEnd" : "nav-item"}>
        <a href={props.item=="Home"?"/postings": props.item=="Profile" ? `/profile/${authState.id}` : "#"} className="icon-button" onClick={() => setOpen(!open)}>
          {props.icon}
        </a>
        {open && props.children}
      </li>
    </AuthContext.Provider>
  );
 }
 
 
 function DropdownMenu() {
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);
 
  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight)
  }, [])
 
  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }
 
  function DropdownItem(props) {
    let location = useNavigate()
    const { authState, setAuthState } = useContext(AuthContext);
    const logout = () => {
      localStorage.removeItem("accessToken");
      setAuthState({ username: "", id: 0, status: false });
      location("/"); //login page
    }
 
    const out =()=>{
      if(props.children == "Logout"){
        localStorage.removeItem("accessToken");
        setAuthState({ username: "", id: 0, status: false });
        location("/"); //login page
      }
      else if(props.children=="Settings"){
        location(`/settings/${authState.id}`);
      }
    }
 
    return (
      <AuthContext.Provider value={{ authState, setAuthState }}>  
       <div //href={props.children=="Settings"?`/settings/${authState.id}`: ""} 
       className="menu-item"
       onClick={out}
       /*onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}*/>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </div>
      </AuthContext.Provider>
      /*
      <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
      */
    );
  }
 
  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>
      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          {/*
          <DropdownItem >My Profile</DropdownItem>
          */}
          <DropdownItem
            leftIcon={<SettingsIcon />}
            rightIcon={<SettingsIcon />}
            goToMenu="settings">
            Settings
          </DropdownItem>
         
          <DropdownItem
            leftIcon={<LogoutIcon />}
            //rightIcon={<LogoutIcon />}
            goToMenu="animals">
            Logout
          </DropdownItem>
         
 
 
        </div>
      </CSSTransition>
 
 
      <CSSTransition
        in={activeMenu === 'settings'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon={<DownIcon />}>
            <h2>My Tutorial</h2>
          </DropdownItem>
          <DropdownItem leftIcon={<UndefinedIcon />}>HTML</DropdownItem>
          <DropdownItem leftIcon={<UndefinedIcon />}>CSS</DropdownItem>
          <DropdownItem leftIcon={<UndefinedIcon />}>JavaScript</DropdownItem>
          <DropdownItem leftIcon={<UndefinedIcon />}>Awesome!</DropdownItem>
        </div>
      </CSSTransition>
 
      {/*
      <CSSTransition
        in={activeMenu === 'animals'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          {/*
          <DropdownItem goToMenu="main" leftIcon={<ArrowIcon />}>
            <h2>Animals</h2>
          </DropdownItem>
          <DropdownItem leftIcon="🦘">Kangaroo</DropdownItem>
          <DropdownItem leftIcon="🐸">Frog</DropdownItem>
          <DropdownItem leftIcon="🦋">Horse?</DropdownItem>
          <DropdownItem leftIcon="🦔">Hedgehog</DropdownItem>
         
        </div>
      </CSSTransition>
      */}
    </div>
  );
 }
 
 
 export default App;
 
