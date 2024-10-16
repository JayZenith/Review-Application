import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { DropdownContext } from "../helpers/DropdownContext";
import { ScreenContext } from '../helpers/ScreenContext';
import { SuggestionsContext } from "../helpers/SuggestionsContext";
import { RenderContext } from "../helpers/RenderContext";
import { FaStar } from 'react-icons/fa' 
import ClipLoader from "react-spinners/ClipLoader";
import ProfileCSS from '../styles/Profile.module.css';
import linkIcon from '../icons/link.svg'

function Profile() {
   let { id } = useParams();
   let navigate = useNavigate();

   const [postText, setPost] = useState('');
   const [username, setUsername] = useState("");
   const [profilePic, setProfilePic] = useState("");
   const [listOfPosts,setListOfPosts] = useState([]);
   const [likedPosts, setLikedPosts] = useState([])
   
   const { authState } = useContext(AuthContext);
   const [posted, setPosted] = useState(false);
   const [reviewSize, setReviewSize] = useState(0);

   const { arrowState, setArrowState } = useContext(ScreenContext);
   const { dropdownState, setDropdownState } = useContext(DropdownContext);
   const { suggestionsState, setSuggestionsContext } = useContext(SuggestionsContext);
   const { render, setRenderState } = useContext(RenderContext);


   const [rating, setRating] = useState(null)
   const [hover, setHover] = useState(null)

   const [numOfReviews, setNumOfReviews] = useState(0);
   const [theBio, setTheBio] = useState('');
   const [theProfileLink, setTheProfileLink] = useState(null);

   const [loading, isLoading]=useState(false)
   const avgRating = useRef(0)

   
   

   useEffect(()=>{
    if(!localStorage.getItem("accessToken")){
        navigate("/");
    }
   }, [posted])
  
   useEffect(()=>{
        //setPosted(true);
       //setSuggestionsContext([]);
       axios.get(process.env.REACT_APP_HTTP_REQ+`/getBio/${id}`)
       //axios.get(`http://3.20.232.190:3001/getBio/${id}`)
        .then((response)=>{
            //console.log(response)
            if(response.data[0]){
                setTheBio(response.data[0].bioText)
                setTheProfileLink(response.data[0].profileLink)
            }
        })
    },[])

   useEffect(()=>{
        avgRating.current=0;
        axios.get(process.env.REACT_APP_HTTP_REQ+`/profilePosts/${id}`)
        //axios.get(`http://3.20.232.190:3001/profilePosts/${id}`)
            .then((response)=>{
                //console.log(response.data)
                response.data.forEach(function(fruit){
                    //console.log(fruit.rating);
                    avgRating.current = avgRating.current + fruit.rating;
                });
                //console.log(avgRating.current)
                avgRating.current = avgRating.current/(5*response.data.length);
                avgRating.current = (5*(avgRating.current*100)) / 100;
                avgRating.current = Math.ceil(avgRating.current)
                //console.log("Average: ", avgRating);
                //console.log("check", response.data)
                setListOfPosts(response.data)
                setNumOfReviews(response.data.length);
                setPosted(false)
            })
   },[posted])


   useEffect(()=>{
        //console.log(render);
        isLoading(true);
        axios.get(process.env.REACT_APP_HTTP_REQ+`/basicInfo/${id}`)
        //axios.get(`http://3.20.232.190:3001/basicInfo/${id}`)
        .then((response) => {
               console.log(response.data[0])
               //setUsername(response.data[0].username)
            setProfilePic(response.data[0].ImageData)
            setUsername(response.data[0].firstname +" "+response.data[0].lastname);
        });
        isLoading(false);
        //setRenderState(false);
   }, [])



   const likePost = (postId) => {
       axios.post(process.env.REACT_APP_HTTP_REQ+"/likes", {
       //axios.post("http://3.20.232.190:3001/likes", {
           postID: postId
           //console.log(response.data.listOfPosts)
           //console.log(response.data.userLikes)
       }, {
           headers: {accessToken: localStorage.getItem("accessToken")}
       }).then((response) => {
           setListOfPosts(listOfPosts.map((post) => {
               if(post.id === postId){
                   //alert(response.data.liked)
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


   }

   const [errMsg, setErrMsg] = useState('');
   const [reviewErrMsg, setReviewErrMsg] = useState('');


   const onSubmit = (event) => {
       
       //console.log(rating)
       event.preventDefault(); //dosent work without
       if(postText.length === 0 && rating === null){
        setReviewErrMsg('*Must include review*')
        setErrMsg('*Must include rating*')
        return;
       }
       if(postText.length === 0){
        setReviewErrMsg('*Must include review*')
        return;
       }
       if(rating === null){
        setErrMsg('*Must include rating*')
        return;
        
       }
       
       axios.post(process.env.REACT_APP_HTTP_REQ+"/posts", {
       //axios.post("http://3.20.232.190:3001/posts", {
         postText, id, rating, username //username?
       }, {
         headers: {accessToken: localStorage.getItem("accessToken")},
       }).then((res) => {
           if(res.data.error){
             alert(res.data.error);
           }
           setPost(''); //to clear text field
           setErrMsg('') //to reset error if theres not rating 
           setReviewErrMsg('');
           setPosted(true);
           setRenderState(true);
           //navigate("/postings");
       });
 
     }  

     const handleReviewChange = (e)=>{
        //console.log(e.target.value.length)
        setReviewErrMsg('')
        setReviewSize(e.target.value.length)
        setPost(e.target.value);
        
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

      const editProfile = () => {
        navigate("/profile/editProfile")
      }


    const checkRating = (check) => {
        setReviewErrMsg('')
        setErrMsg('')
        //console.log(check);
        setRating(check);
    }

    const out = () =>{
        navigate(`/profile/editProfile/`);
    }

   

 return (
    <div className={ProfileCSS.profileApp}> {/*postings*/}
        <div className={ProfileCSS.profileTitleWrap}>
            
            <h1 className={ProfileCSS.profileUsername}> {username} </h1>
            {authState.id == id ? <button className={ProfileCSS.profileEdit} onClick={out}>Edit Profile</button>: ""}
        </div>
        {/*<img className={ProfileCSS.profileAvatar} src={`http://3.20.232.190:3001/images/`+profilePic} width="100" height="100" alt="" />*/}
        <img className={ProfileCSS.profileAvatar} src={process.env.REACT_APP_HTTP_REQ+`/images/`+profilePic} width="100" height="100" alt="" />
        
        {!isNaN(avgRating.current) ? <p className={ProfileCSS.userRating}>Rating: {avgRating.current}/5</p> : <p className={ProfileCSS.userRating}>No Ratings</p> }


        
        <div className={ProfileCSS.ratingStars} >
                                    {[...Array(5)].map((star, idx)=>{
                                        //console.log(props.children)
                                        const currentRate = idx + 1;
                                        return(
                                            <>
                                                <label>
                                                <input className="radioBtn" type="radio" name="rating"  
                                                    value={currentRate}                                                
                                                />
                                                    <FaStar className='ratingStar' size={30}
                                                        color={currentRate <= (hover || avgRating.current) ?
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



        {theBio ? 
        <div className={ProfileCSS.profileBio}>{theBio}</div>
        : <></>}
        <ul className={ProfileCSS.profileLinks}>
            {theProfileLink ? <TheLink item={linkIcon} theHref={theProfileLink}>{theProfileLink}</TheLink> : <></>}
        </ul>
        
        {authState.id != id ?  ( //if user then hide review option
            <div className={ProfileCSS.profileReview}> 
                <h2 className={ProfileCSS.writeReview}>WRITE A REVIEW</h2>
                <form  onSubmit={onSubmit}> 
                    {reviewSize == 500 ? <p className={ProfileCSS.charLimit}>Character Limit Reached</p> : <p className={ProfileCSS.hidden}>""</p>}
                    <textarea
                       placeholder="Write Here"
                       id = "posting"
                       name = "posting"
                       value={postText}
                       onChange={(e)=>handleReviewChange(e)}
                       maxLength={500}
                    >
                    </textarea>
                    <p className={ProfileCSS.errorMessage}>{reviewErrMsg}</p>
                    <p className={reviewSize >= 450 ? ProfileCSS.redInputSize: ""}>{reviewSize}/500</p>
                    
                    <div className={ProfileCSS.rating}>
                        {[...Array(5)].map((star, idx)=>{
                            const currentRate = idx + 1
                        
                            return(
                                <>
                                    <label>
                                        <input className="radioBtn" type="radio" name="rating"  
                                            value={currentRate}
                                            onClick={()=>checkRating(currentRate)}
                                        />
                                        <FaStar className='star' size={30}
                                            color={currentRate <= (hover || rating) ?
                                                "red"
                                                :"white"
                                            }
                                            //onMouseEnter={()=>setHover(currentRate)}
                                            //onMouseLeave={()=>setHover(null)}
                                        />
                                    </label>
                                </>  
                            )
                        })}
                     </div> {/*rating*/}
                     <p className={ProfileCSS.errorMessage}>{errMsg}</p>
                    <button type="submit">Post</button>
               </form>
            </div>
        ) : <></>}

        <div className={ProfileCSS.profilePageContainer}>
            <h2>REVIEWS</h2>
            <p># of reviews: {numOfReviews}</p>
            <div className={ProfileCSS.listOfPosts}> {/*NEEDED TO SEPERATE FROM ABOVE?*/}
               {listOfPosts.slice(0).reverse().map((val, key) => {
               return (
                    <div className={ProfileCSS.profilePost}> {/*post*/}
                        <div className={ProfileCSS.userWrapper}
                            onClick={()=> {
                                navigate(`/profile/${val.userID}`);
                                window.location.reload()
                            }}
                        >
                            <div className={ProfileCSS.avatar}>
                            {val.ImageData? 
                            //http://3.143.203.151:3001
                                //<img className={ProfileCSS.imgAvatar} src={`http://3.20.232.190:3001/images/`+val.ImageData} width="200" height="100" alt="" />
                                <img className={ProfileCSS.imgAvatar} src={process.env.REACT_APP_HTTP_REQ+`/images/`+val.ImageData} width="200" height="100" alt="" />
                                //<></>
                                :
                                <></>
                            }
                            </div>
                            
                        </div> {/*END USER-WRAPPER*/}
                        <div className={ProfileCSS.profileBodyAndFooter}>
                            <div className={ProfileCSS.reviewStarRating}>
                                <div className={ProfileCSS.username}>
                                        {val.firstname} {val.lastname}
                                </div>
                                <div className={ProfileCSS.ratingStars} >
                                    {[...Array(5)].map((star, idx)=>{
                                        //console.log(props.children)
                                        const currentRate = idx + 1;
                                        return(
                                            <>
                                                <label>
                                                <input className="radioBtn" type="radio" name="rating"  
                                                    value={currentRate}                                                
                                                />
                                                    <FaStar className='ratingStar' size={20}
                                                        color={currentRate <= (hover || val.rating) ?
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

                                {/*<Star >{val.rating}</Star>*/}
                            </div>
                            <div className={ProfileCSS.profileBody}  
                                onClick={() => {
                                    navigate(`/singlePost/${val.id}`);
                                }}
                            > 
                                <p>{val.postText}</p>
                            </div>
                            <div className={ProfileCSS.profileFooter}> 
                                {authState.email === val.email? (
                                     <i className="bi bi-trash" onClick={()=>{deletePost(val.id)}}>                 
                                    </i>
                                ):(<i></i>)}
                                <p className={ProfileCSS.createdAt}>{val.createdAt}</p>
                                <div className='likeBtn'>
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
                                </div> {/*likeBtn*/}
                            </div>
                        </div>
                    </div>
                   );
               })}
           </div>


       </div>
   </div>
 );
}

function TheLink(props){
    return(
        <li>
            <a className={ProfileCSS.profileLink} href={props.theHref}><img src={props.item} alt={"home"} width="10" height="10"/>{props.children}</a>
        </li>
    );
}

function Star(props){
   const [rating, setRating] = useState(null)
   const [rateColor, setRateColor] = useState(null)
   const [hover, setHover] = useState(null)
   
   useEffect(()=>{
    console.log(props.children)
    setRating(props.children);
   },[])

    return(
        <div className="ratingStars" >
            {[...Array(5)].map((star, idx)=>{
                //console.log(props.children)
                const currentRate = idx + 1;
                return(
                    <>
                        <label>
                        <input className="radioBtn" type="radio" name="rating"  
                            value={currentRate}
                            
                                                
                        />
                            <FaStar className='ratingStar' size={20}
                                color={currentRate <= (hover || rating) ?
                                    "red"
                                    : "black"
                                }
                                //onMouseEnter={()=>setHover(currentRate)}
                                //onMouseLeave={()=>setHover(null)}
                            />
                        </label>
                    </>  
                )
            })}
        </div>  
    )
}



export default Profile