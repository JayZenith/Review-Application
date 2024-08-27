import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { DropdownContext } from "../helpers/DropdownContext";
import { ScreenContext } from '../helpers/ScreenContext';
import { SuggestionsContext } from "../helpers/SuggestionsContext";
import { FaStar } from 'react-icons/fa' 


function Profile() {
   let { id } = useParams();
   const [postText, setPost] = useState('');
   const [username, setUsername] = useState("");
   const [listOfPosts,setListOfPosts] = useState([]);
   //const [listOfPosts,setListOfPosts] = useState([]);
   const [likedPosts, setLikedPosts] = useState([])
   let navigate = useNavigate();
   const { authState } = useContext(AuthContext);
   const [posted, setPosted] = useState(false);
   const [reviewSize, setReviewSize] = useState(0);
   const { arrowState, setArrowState } = useContext(ScreenContext);
   const { dropdownState, setDropdownState } = useContext(DropdownContext);
   const { suggestionsState, setSuggestionsContext } = useContext(SuggestionsContext);


   const [rating, setRating] = useState(null)
   const [rateColor, setRateColor] = useState(null)
   const [hover, setHover] = useState(null)




   useEffect(()=>{
       //setSuggestionsContext([]);
   })
  
   useEffect(()=>{
         if (!localStorage.getItem("accessToken")){
           navigate("/");
         } else {
           axios.get(`http://localhost:3001/basicInfo/${id}`)
           .then((response) => {
               //console.log(response.data[0].username)
               setUsername(response.data[0].username)
           });


           axios.get(`http://localhost:3001/byuserId/${id}`)
           .then((response) => {
               //console.log(response.data[0].username)
               //console.log(response.data[0])
               setListOfPosts(//response.data.listOfPosts
                  
                   response.data.listOfPosts.filter((post)=>{
                       if (post.targetID != parseInt(id)){
                           //console.log(post)
                           //return post
                       }
                       else{
                           return post;
                       }
                   })
                  
               );
               //console.log(listOfPosts)
               //console.log(response.data.listOfPosts)
               //console.log(response.data.userLikes)
               setLikedPosts(
                   response.data.userLikes.map((like) => {
                     return like.id;
                   })
                 );
                 //console.log(likedPosts)
                 setPosted(false)
                 setRating(null); //reset star rating
           });
          
         }
          
   }, [posted])




   const likePost = (postId) => {
       axios.post("http://localhost:3001/likes", {
           postID: postId
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
       console.log(rating)
       event.preventDefault(); //dosent work without
       axios.post("http://localhost:3001/posts", {
         postText, id, rating, username
       }, {
         headers: {accessToken: localStorage.getItem("accessToken")},
       }).then((res) => {
           if(res.data.error){
             alert(res.data.error);
           }
           //console.log("worked");
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
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }).then(()=> {
          setPosted(true); //to render deleted post
          //navigate("/postings"); Ishouldnt need this
        });
      };



const checkRating = (check) => {
    //console.log(check);
    setRating(check);
}



 return (
    <div className='profileApp'> {/*postings*/}
        <h1> {username} </h1>
        {authState.id != id ?  ( //if user then hide review option
            <div className="profileReview"> 
                <h2>WRITE A REVIEW</h2>
                <form  onSubmit={onSubmit}> 
                    {reviewSize == 500 ? <p>Character Limit Reached</p> : ""}
                    <textarea
                       placeholder="..."
                       id = "posting"
                       name = "posting"
                       onChange={(e)=>handleReviewChange(e)}
                       maxLength={500}
                    >
                    </textarea>
                    <p>{reviewSize}/500</p>
                    <div className="rating" >
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
                    <button type="submit">Post</button>
               </form>
            </div>
        ) : <></>}
        

        <div className='profilePageContainer'>
           {/*
           <div className='basicInfo'>
              
               {authState.username === username && (
                   <button onClick={() => {navigate(`/Settings/${id}`)}}> Settings </button>
               )}
           </div>
           */}
            <h2>REVIEWS</h2>
            <div className='listOfPosts'> {/*NEEDED TO SEPERATE FROM ABOVE?*/}
               {listOfPosts.slice(0).reverse().map((val, key) => {
               return (
                    <div className="profilePost"> {/*post*/}
                        <div className="userWrapper"
                             onClick={()=> {
                                navigate(`/profile/${val.userID}`);
                                window.location.reload()
                                }}
                        >
                            <div className="avatar">
                            </div>
                            <div className="username">
                                    {val.username} 
                            </div>
                        </div> {/*END USER-WRAPPER*/}
                       <div className='profileBodyAndFooter'>
                            <div className="reviewStarRating">
                                

{/****************************************************8 */}


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
                                color={currentRate <= (hover || val.rating) ?
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



{/****************************************** */}













                                {/*<Star >{val.rating}</Star>*/}
                            </div>
                            <div className="profileBody"  
                                onClick={() => {
                                    navigate(`/singlePost/${val.id}`);
                                }}
                            > 
                                <p>{val.postText}</p>
                            </div>
                            <div className="profileFooter"> 
                                {authState.username === val.username? (
                                     <i className="bi bi-trash" onClick={()=>{deletePost(val.id)}}>                 
                                    </i>
                                ):(<i></i>)}
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
