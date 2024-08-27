import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { DropdownContext } from "../helpers/DropdownContext";
import { ScreenContext } from '../helpers/ScreenContext';
import { SuggestionsContext } from "../helpers/SuggestionsContext";


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
                           console.log(post)
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
                 console.log(likedPosts)
                 setPosted(false)
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
       event.preventDefault(); //dosent work without
       axios.post("http://localhost:3001/posts", {
         postText, id
       }, {
         headers: {accessToken: localStorage.getItem("accessToken")},
       }).then((res) => {
           if(res.data.error){
             alert(res.data.error);
           }
           console.log("worked");
           setPosted(true);
           //navigate("/postings");
       });
 
     }  

     const handleReviewChange = (e)=>{
        //console.log(e.target.value.length)
        setReviewSize(e.target.value.length)
        setPost(e.target.value);
      }



 return (
    <div className='profileApp'> {/*postings*/}
        <h1> {username} </h1>
        {authState.id != id ?  ( //if user then hide review option
            <div className="profileReview"> 
                <form  onSubmit={onSubmit}> 
                    {reviewSize == 500 ? <p>Character Limit Reached</p> : ""}
                    <textarea
                       placeholder="Review Me!"
                       id = "posting"
                       name = "posting"
                       onChange={(e)=>handleReviewChange(e)}
                       maxLength={500}
                    >
                    </textarea>
                    <p>{reviewSize}/500</p>
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
                       <div className="profileBody"  
                           onClick={() => {
                               navigate(`/singlePost/${val.id}`);
                           }}
                       > {val.postText}
                       </div>
                       <div className="profileFooter"> 
                          
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
                    </div>
                   );
               })}
           </div>


       </div>
   </div>
 );
}


export default Profile
