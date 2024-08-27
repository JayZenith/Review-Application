import React, { useContext, useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthContext } from "../helpers/AuthContext";
import { SuggestionsContext } from "../helpers/SuggestionsContext";


function Postings() {
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
   let navigate = useNavigate();
  


   useEffect(()=>{ //Check for acccessToken
     if (!localStorage.getItem("accessToken")){
       navigate("/"); //if not go to login
     }
   }, []);




   useEffect(()=>{ //Load the Users
     const loadUsers = async () => {
       const response = await axios.get("http://localhost:3001/users");
       //console.log(response.data);
       setUsers(response.data)
     }
     loadUsers();
   }, [])


  
   useEffect(() => { //load posts and likes of posts
     if (!localStorage.getItem("accessToken")){
       navigate("/"); //if not go to login
     }
     else { //without the website will break
       axios.get("http://localhost:3001/posts", {
         headers: {accessToken: localStorage.getItem("accessToken")}
       }).then((res) => {
       setListOfPosts(res.data.listOfPosts);
       setLikedPosts(
         res.data.userLikes.map((like) => {
           return like.id;
         })
       );
       setPosted(false); //to reset call to render created post
       });
     }
   }, [posted]); //render if we create a new post. Redundant?


   const likePost = (postId) => {
       axios.post("http://localhost:3001/likes", {
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


   }
  
   const onSubmit = (event) => {
     event.preventDefault(); //without will redirect incorreclty
     axios.post("http://localhost:3001/posts", {
       postText
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
     axios.delete(`http://localhost:3001/deletePost/${id}`, {
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


   const handleKeyUp = (e) => {
    
     if(e.key === "Enter"){
       userSearch();
     }
   }


   const logout = () => {
     localStorage.removeItem("accessToken");
     setAuthState({ username: "", id: 0, status: false });
     navigate("/"); //login page
   }


    const handleInputChange = (e)=>{
      //console.log(e.target.value.length)
      setInputSize(e.target.value.length)
      setPost(e.target.value);
    }


  


 return (
   <div className="postings">
       <div className="createPostSection">
           <form className="postForm" onSubmit={onSubmit}>
            {inputSize == 500 ? <p>Character Limit Reached</p> : ""}
             <textarea
                 placeholder="Write Here"
                 id = "posting"
                 name = "posting"
                 onChange={(e)=>handleInputChange(e)}
                 maxLength={500}
             >
             </textarea>
             <p>{inputSize}/500</p>
             <button type="submit">Post</button>
           </form>
       </div> {/*END createPostSection*/}
       {listOfPosts.slice(0).reverse().map((val, key) => {
         return (
           <div className="post">       
             <div className="userWrapper">
                 <Link to={`/profile/${val.userID}`}>
                   <div className="avatar">
                     </div>
                   </Link>
                   <div className="username">
                       <Link to={`/profile/${val.userID}`}>{val.username} </Link>
                   </div>
             </div> {/*END USER-WRAPPER*/}
               {/*<div className="title"> {val.title} </div>*/}
             <div className="bodyAndFooter">
               <div className="body"
                     onClick={() => {
                         navigate(`/singlePost/${val.id}`);
                       }}
                 >
                   <p>{val.postText}</p>
               </div> {/*END BODY*/}
               <div className="footer">
                     {authState.username === val.username ? (
                       <i className="bi bi-trash" onClick={()=>{deletePost(val.id)}}>                 
                       </i>
                     ):(<i></i>)} {/*Need the latter icon to move like button to right*/}
                     <div className="like-btn">
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
             <div className="theTarget"
                        onClick={()=> {
                          navigate(`/profile/${val.targetID}`);
                          window.location.reload()
                          }}
                       >
                        <div className="avatar">
                          
                        </div>
                         To {val.targetName}
                
              </div>
           </div>
         );
       })}
   </div>
 );
}






export default Postings;
