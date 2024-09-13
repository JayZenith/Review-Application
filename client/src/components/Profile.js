import React, { useContext, useEffect, useState } from 'react'
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

function Profile() {
   let { id } = useParams();
   let navigate = useNavigate();

   const [postText, setPost] = useState('');
   const [username, setUsername] = useState("");
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

   const [loading, isLoading]=useState(false)

   

   useEffect(()=>{
    if(!localStorage.getItem("accessToken")){
        navigate("/");
    }
   }, [posted])
  
   useEffect(()=>{
        //setPosted(true);
       //setSuggestionsContext([]);
       axios.get(`http://localhost:3001/getBio/${id}`)
       //axios.get(`http://3.143.203.151:3001/getBio/${id}`)
        .then((response)=>{
            console.log(response)
            if(response.data[0])
                setTheBio(response.data[0].bioText)
        })
    },[])

   useEffect(()=>{
        axios.get(`http://localhost:3001/profilePosts/${id}`)
        //axios.get(`http://3.143.203.151:3001/profilePosts/${id}`)
            .then((response)=>{
                console.log(response.data)
                setListOfPosts(response.data)
                setNumOfReviews(response.data.length);
                setPosted(false)
            })
   },[posted])


   useEffect(()=>{
        //console.log(render);
        isLoading(true);
        axios.get(`http://localhost:3001/basicInfo/${id}`)
        //axios.get(`http://3.143.203.151:3001/basicInfo/${id}`)
        .then((response) => {
               //console.log(response.data[0].username)
               //setUsername(response.data[0].username)
            setUsername(response.data[0].firstname +" "+response.data[0].lastname);
        });
        isLoading(false);
        //setRenderState(false);
   }, [])



   const likePost = (postId) => {
       axios.post("http://localhost:3001/likes", {
        //axios.post("http://3.143.203.151:3001/likes", {
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


   const onSubmit = (event) => {
       //console.log(rating)
       event.preventDefault(); //dosent work without
       axios.post("http://localhost:3001/posts", {
        //axios.post("http://3.143.203.151:3001/posts", {
         postText, id, rating, username //username?
       }, {
         headers: {accessToken: localStorage.getItem("accessToken")},
       }).then((res) => {
           if(res.data.error){
             alert(res.data.error);
           }
           setPosted(true);
           //navigate("/postings");
       });
 
     }  

     const handleReviewChange = (e)=>{
        //console.log(e.target.value.length)
        setReviewSize(e.target.value.length)
        setPost(e.target.value);
      }


      const deletePost = (id) => {
        axios.delete(`http://localhost:3001/deletePost/${id}`, {
        //axios.delete(`http://3.143.203.151:3001/deletePost/${id}`, {
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
        //console.log(check);
        setRating(check);
    }



 return (
    <div className={ProfileCSS.profileApp}> {/*postings*/}
        <h1 className={ProfileCSS.profileUsername}> {username} </h1>
        {theBio ? 
        <div className={ProfileCSS.profileBio}>{theBio}</div>
        : <></>}
        {authState.id != id ?  ( //if user then hide review option
            <div className={ProfileCSS.profileReview}> 
                <h2 className={ProfileCSS.writeReview}>WRITE A REVIEW</h2>
                <form  onSubmit={onSubmit}> 
                    {reviewSize == 500 ? <p className={ProfileCSS.charLimit}>Character Limit Reached</p> : <p className={ProfileCSS.hidden}>""</p>}
                    <textarea
                       placeholder="..."
                       id = "posting"
                       name = "posting"
                       onChange={(e)=>handleReviewChange(e)}
                       maxLength={500}
                    >
                    </textarea>
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
                                //<img className={ProfileCSS.imgAvatar} src={`http://3.143.203.151:3001/images/`+val.ImageData} width="200" height="100" alt="" />
                                <img className={ProfileCSS.imgAvatar} src={`http://localhost:3001/images/`+val.ImageData} width="200" height="100" alt="" />
                                //<></>
                                :
                                <></>
                            }
                            </div>
                            
                        </div> {/*END USER-WRAPPER*/}
                        <div className={ProfileCSS.profileBodyAndFooter}>
                            <div className={ProfileCSS.reviewStarRating}>
                                <div className={ProfileCSS.username}>
                                        {val.firstname} 
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
                                <p className={ProfileCSS.createdAt}>{val.created_at}</p>
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