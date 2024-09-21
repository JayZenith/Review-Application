import React, { useContext, useRef, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthContext } from "../helpers/AuthContext";
import { SuggestionsContext } from "../helpers/SuggestionsContext";
import { FaStar } from 'react-icons/fa'
import PostingsCSS from '../styles/Postings.module.css'; 
import ClipLoader from "react-spinners/ClipLoader";


function Postings() {
  let navigate = useNavigate();

   const [postText, setPost] = useState('');
   const [listOfPosts, setListOfPosts] = useState([]);
   const [likedPosts, setLikedPosts] = useState([])
   const { authState, setAuthState } = useContext(AuthContext);
   const { suggestionsState, setSuggestionsContext } = useContext(SuggestionsContext);
   const [posted, setPosted] = useState(false);
   const [users, setUsers] = useState([])
   const [input, setInput] = useState(''); //input in search field
   const [jsonData, setJSON] = useState([])//for users during usr search
   const [suggestions, setSuggestions] = useState([])
   const [inputSize, setInputSize] = useState(0)
   const [theTargets, setTheTargets] = useState([])
   const [hover, setHover] = useState(null)
   const [topusers, setTopUsers] = useState([])
   const [starMe, setStarMe] = useState(true);
   const [toPost, setToPost] = useState(false);
   const [profilePosts, setProfilePosts] = useState({
    isFeed: false,
    isProfile: true, 
  })


  
   useEffect(()=>{ //Check for acccessToken
     if (!localStorage.getItem("accessToken")){
       navigate("/"); //if not go to login
     }
   }, []);

   

   


   



    useEffect(()=>{ //Load the Users
      const loadUsers = async () => {
        const response = await axios.get(process.env.REACT_APP_HTTP_REQ+"/users");
        //const response = await axios.get("http://3.20.232.190:3001/users");
        //console.log(response.data);
     
        setUsers(response.data)
      }
      
      loadUsers();
    }, [])


    useEffect(()=>{
      //avgRating.current=0;
      const loadProfilePosts = async () => {
        //const response = await axios.get(process.env.REACT_APP_HTTP_REQ+"/reviewPosts6")
        const response = await axios.get(process.env.REACT_APP_HTTP_REQ+"/justReviews4");
        //const response = await axios.get(`http://3.20.232.190:3001/profilePosts/${authState.id}`)
        //axios.get(`http://3.20.232.190:3001/profilePosts/${authState.id}`)
            //.then((response)=>{
                //console.log(response.data)
                //response.data.forEach(function(fruit){
                    //console.log(fruit.rating);
                    //avgRating.current = avgRating.current + fruit.rating;
                //});
                //console.log(avgRating.current)
                //avgRating.current = avgRating.current/(5*response.data.length);
                //avgRating.current = (5*(avgRating.current*100)) / 100;
                //avgRating.current = Math.ceil(avgRating.current)
                //console.log("Average: ", avgRating);
                setTheTargets(response.data.array2);
                setListOfPosts(response.data.array1);
                console.log(response);
                
                //setNumOfReviews(response.data.length);
                setPosted(false)
           // })
      }

      if(profilePosts.isProfile && !profilePosts.isFeed){
        loadProfilePosts();
      }
      },[posted, profilePosts])
    
/*
    useEffect(()=>{
      //axios.get("http://localhost:3001/posts4", {
      const loadPosts = async () => {
          //const response = await axios.get("http://3.20.232.190:3001/posts4", {
          const response = await axios.get(process.env.REACT_APP_HTTP_REQ+"/posts4", { 
            headers: {accessToken: localStorage.getItem("accessToken")}
          });
          console.log(response);
          setTheTargets(response.data.array2);
          setListOfPosts(response.data.array1);
          
    

          setPosted(false); //to reset call to render created post
        }
        if(profilePosts.isFeed && !profilePosts.isProfile){ //if not loading profile posts 
          loadPosts();

        }
        
    }, [posted, profilePosts])
*/

    useEffect(()=>{
      //axios.get("http://localhost:3001/posts4", {
      const loadPosts = async () => {
          //const response = await axios.get("http://3.20.232.190:3001/posts4", {
          const response = await axios.get(process.env.REACT_APP_HTTP_REQ+"/justPosts6")
          //console.log(response);
          //setTheTargets(response.data.array2);
          setListOfPosts(response.data);
          
    

          setPosted(false); //to reset call to render created post
        }
        if(profilePosts.isFeed && !profilePosts.isProfile){ //if not loading profile posts 
          loadPosts();

        }
        
    }, [posted, profilePosts])

  
    /*
    setLikedPosts(
      res.data.userLikes.map((like) => {
        return like.id;
      })
    );
    */
   /*
  useEffect(()=>{
    axios.get("http://localhost:3001/posts4", {
    //axios.get("http://3.21.53.40:3001/posts4", {
      headers: {accessToken: localStorage.getItem("accessToken")}
    }).then((res) => {
    console.log(res.data)
    setTheTargets(res.data.array2);
    setListOfPosts(res.data.array1);
    
    setPosted(false); //to reset call to render created post
    });
  }, [posted])
  */

  

   const likePost = (postId) => {
       axios.post(process.env.REACT_APP_HTTP_REQ+"/likes", {
       //axios.post("http://3.20.232.190:3001/likes", {
           postID: postId
       }, {
           headers: {accessToken: localStorage.getItem("accessToken")}
       }).then((response) => {
           setListOfPosts(listOfPosts.map((post) => {
               if(post.id === postId){
                   if(response.data.liked)
                       return{...post, dt:post.dt+1}
                   else
                       return{...post, dt:post.dt-1}
               } else {
                   return post;
               }
           }))
           if(likedPosts.includes(postId)){
             setLikedPosts(
               likedPosts.filter((id) => {
                 return id != postId;
               })
             );
           } else {
             setLikedPosts([...likedPosts,postId])
           }
       })
   } //Come back to all this 
  
   const onSubmit = (event) => {
     event.preventDefault(); //without will redirect incorreclty
     setToPost(false);
     axios.post(process.env.REACT_APP_HTTP_REQ+"/posts", {
     //axios.post("http://3.20.232.190:3001/posts", {
       postText, 
     }, {
       headers: {accessToken: localStorage.getItem("accessToken")},
     }).then((res) => {
         if(res.data.error){
           alert(res.data.error);
         }
        
         setPosted(true); //to render for new post

     });
   } 
  
   const deletePost = (id) => {
      axios.delete(process.env.REACT_APP_HTTP_REQ+`/deletePost/${id}`, {
      //axios.delete(`http://3.20.232.190:3001/deletePost/${id}`, {
       headers: {
         accessToken: localStorage.getItem("accessToken"),
       },
     }).then(()=> {
       setPosted(true); //to render deleted post
       //navigate("/postings"); Ishouldnt need this
     });
   };

   const userSearch = () => {
     //console.log(suggestions);
     //console.log("signalState ",signalState);
     navigate(`/userSearch`);
   }




    /*
    const onChangeHandler = (text) => {
     let matches = []
     if (text.length > 0){
       matches = users.filter(user=>{
         const regex = new RegExp(`^${text}`,"gi");
         return user.username.match(regex);
       })
     }
     //console.log('matches ',matches)
     setSuggestions(matches)
     setSuggestionsContext(matches);//to set useContext hook right away due to lag
     setInput(text) //set search input
   }
     */


   /*
   const handleKeyUp = (e) => {
    
     if(e.key === "Enter"){
       userSearch();
     }
   }
    */


  /*
   const logout = () => {
     localStorage.removeItem("accessToken");
     setAuthState({ username: "", id: 0, status: false });
     navigate("/"); //login page
   }
*/

    const handleInputChange = (e)=>{
      //console.log(e.target.value.length)
      setInputSize(e.target.value.length)
      setPost(e.target.value);
    }

    
    //const[imgData, setImgData] = useState([])
    /*
    useEffect(()=>{
      axios.get(`http://localhost:3001/getAvatar/${authState.id}`)
      .then(res=>setImgData(res.data[0]))
      .catch(err=>console.log(err))
    },[])

    */


    const showFeed = ()=>{
      setProfilePosts({isFeed:true, isProfile:false})
    }
    
    const showProfileFeed = () => {
      setProfilePosts({isFeed:false, isProfile:true})
    
    }

    

  

 return (
  <>
  
    <div className={PostingsCSS.postingFeed}
      onClick={()=>setToPost(!toPost)}
    >+
  </div>
   <div className={PostingsCSS.postings}>
   
    <div className={PostingsCSS.feedButtons}>
      {/*<div className={PostingsCSS.feedOne} onClick={showFeed}><h1>Posts</h1></div>*/}
      <div className={PostingsCSS.feedTwo} onClick={showProfileFeed}> <h1>Recent Reviews</h1></div>
      
    </div>

    
    
    
      <div className={PostingsCSS.listOfPostsWrapper}>
      {toPost && (
        <div className={PostingsCSS.createPostSection}>
          
              <form className={PostingsCSS.postForm} onSubmit={onSubmit}>

                <button className={PostingsCSS.xButton} onClick={()=>setToPost(!toPost)}>X</button>
                {inputSize == 500 ? <p className={PostingsCSS.redInputSize}>Character Limit Reached</p> : <p className={PostingsCSS.blackInputSize}></p>}
                <textarea
                  placeholder="Write Here"
                  
                  id = "posting"
                  name = "posting"
                  value={postText}
                  onChange={(e)=>handleInputChange(e)}
                  maxLength={500}
                >
                </textarea>
                <p className={inputSize>=450 ? PostingsCSS.redInputSize : ""}>{inputSize}/500</p>
                <button className={PostingsCSS.postButton} type="submit">Post</button>
              </form>
        </div>
      )}
        {listOfPosts.slice(0).reverse().map((val, key) => {
          const aTarget = theTargets[listOfPosts.length -(key+1)];
          //console.log(listOfPosts.length -(key+1));
          return (
          <div className={PostingsCSS.post}>
               <div className={PostingsCSS.userWrapper}>
                  <Link to={`/profile/${val.userID}`}>
                    <div className={PostingsCSS.avatar}>
                      {val.ImageData?
                      <>
                        {/*<img className={PostingsCSS.imgAvatar} src={`http://3.20.232.190:3001/images/`+val.ImageData} alt="img"/>*/}
                        <img className={PostingsCSS.imgAvatar} src={process.env.REACT_APP_HTTP_REQ+`/images/`+val.ImageData} alt="img" />
                        <div className={PostingsCSS.profileDropDown}>
                          {/*Store the avg in database for user, grab it and display with stars */}
                        </div>
                        {/*<img className={PostingsCSS.imgAvatar} src={`http://3.143.203.151:3001/images/`+val.ImageData} alt="img" />*/}
                      </>
                      :
                      <></>
                      }
                    </div>
                  </Link>
        
               </div> {/*END USER-WRAPPER*/}
                 {/*<div className="title"> {val.title} </div>*/}
               <div className={!val.targetID ? PostingsCSS.bodyAndFooter : PostingsCSS.bodyAndFooter2}>
                  <div className={PostingsCSS.nameAndRating}>
                    <div className={PostingsCSS.username}>
                      <Link to={`/profile/${val.userID}`}>{val.firstname} </Link>
                    </div>
                    {val.targetID ? //then show rating for them
                    <StarRating>{val.rating}</StarRating>
                    :<></>
                    }
                  </div>
                  <div className={!val.targetID ? PostingsCSS.body : PostingsCSS.body2}
                    onClick={() => {
                        navigate(`/singlePost/${val.id}`);
                    }}
                  >
                    <p className={PostingsCSS.bodyText}>{val.postText}</p>
                 </div> {/*END BODY*/}
                
                 {val.targetID ? (
               <div className={PostingsCSS.theTarget}
                  onClick={()=> {
                      navigate(`/profile/${val.targetID}`);
                      window.location.reload()
                  }}
                >
        
                  <div className={PostingsCSS.avatar}>
                      {/* {aTarget.ImageData ? */}
                      {aTarget? 
                      <img className={PostingsCSS.imgAvatar} src={process.env.REACT_APP_HTTP_REQ+`/images/`+aTarget.ImageData} width="200" height="100" alt="" />
                      //<img className={PostingsCSS.imgAvatar} src={`http://3.20.232.190:3001/images/`+aTarget.ImageData} width="200" height="100" alt="" />
                      : <img className={PostingsCSS.imgAvatar} src={""} width="200" height="100" alt="" />
                      }
                  </div>
                  <div className={PostingsCSS.targetUsername}>{aTarget.firstname}</div>
                  {/*aTarget.firstname*/}
                </div>
                ) : (
                  ""
                )}



                 <div className={!val.targetID ? PostingsCSS.footer : PostingsCSS.footer2}>
                       {authState.id === val.userID ? (
                         <i className="bi bi-trash" onClick={()=>{deletePost(val.id)}}>
                         </i>
                       ):(<i></i>)} {/*Need the latter icon to move like button to right*/}
                      
                       <p className={PostingsCSS.createdAt}>{val.createdAt}</p>
                       <div className={PostingsCSS.likebtn}>
                        
                         <i class="bi bi-hand-thumbs-up"
                           onClick={() => {
                               likePost(val.id);
                           }}
                           className={likedPosts.includes(val.id) ? "bi bi-hand-thumbs-up" : "bi bi-hand-thumbs-up red"
                           }
                         ></i> 
                         <label>
                             {val.dt}
                         </label>
                      
                       </div>
                     
                   </div> {/*END FOOTER*/}
               </div>
               
            </div>
           );
         })}
      </div>

   </div>
   </>
  
 );
}



function StarRating(props){
  const [hover, setHover] = useState(null)

  return(
  <div className={PostingsCSS.postingsStarRating}>
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



export default Postings;
