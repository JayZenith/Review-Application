import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import SinglePostCSS from '../styles/SinglePost.module.css'; 



function SinglePost() {
  let { id } = useParams();
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { authState } = useContext(AuthContext);
  const [commentPosted, setCommentPosted] = useState(false);
  let navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3001/singlePost/byId3/${id}`)
      //.get(`http://3.15.215.98:3001/singlePost/byId3/${id}`)
      .then((response) => {
        //console.log(response)
        setPostObject(response.data[0]);
      });
    
  }, [comments]); //did this fix problem of having to rerender upon create/delete comment??
//thought is rerender any change to comments and abovce gets send back comment details

  useEffect(()=>{
    axios.get(`http://localhost:3001/comments3/${id}`).then((response) => {
    //axios.get(`http://3.15.215.98:3001/comments3/${id}`).then((response) => {
      console.log(response.data)
      setComments(response.data);
      setCommentPosted(false);
    });

  },[commentPosted])

  const addComment = () => {
    axios
      .post(
        "http://localhost:3001/comments",
      //.post(
        //"http://3.15.215.98:3001/comments",
        {
          commentBody: newComment,
          postID: id,
          userID: authState.id,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          alert(res.data.error);
        } else {
          //alert(res.data.username)
          const commentToAdd = {
            commentBody: newComment,
            firstname: res.data.firstname,
            //username: res.data.username,
            id: res.data.id,
          };
          setComments([...comments, commentToAdd]);
          setNewComment(""); //to make the newComment value empty within input
          setCommentPosted(true);
        }
      });
  };

  const deleteComment = (id) => {
    axios.delete(`http://localhost:3001/deleteComment/${id}`, {
    //axios.delete(`http://3.15.215.98:3001/deleteComment/${id}`, {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    }).then(()=> {
      setComments(comments.filter((val)=>{
        return val.id != id; //I think i rerender upon each
      }))
    });
  };

  const deletePost = (id) => {
    axios.delete(`http://localhost:3001/deletePost/${id}`, {
    //axios.delete(`http://3.15.215.98:3001/deletePost/${id}`, {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    }).then(()=> {
      navigate("/post");
    });
  };

  const[commentSize, setCommentSize] = useState(0)

  const handleCommentChange = (e)=>{
    //console.log(e.target.value.length)
    setCommentSize(e.target.value.length)
    setNewComment(e.target.value);
  }


  return (
    <div className={SinglePostCSS.singlePostPage}>
        <div className={SinglePostCSS.theSinglePost} id="individual">
          <div className={SinglePostCSS.singlePostBody}>{postObject.postText}</div>
          <div className={SinglePostCSS.singlePostFooter}>
                <div className={SinglePostCSS.singlePostUsername} onClick={()=> {
                                navigate(`/profile/${postObject.userID}`);
                                window.location.reload()
                                }}
                >
                    <div className={SinglePostCSS.singlePostAvatar}>
                      {postObject.ImageData? 
                        <img className={SinglePostCSS.imgAvatar} src={`http://localhost:3001/images/`+postObject.ImageData} width="150" height="80" alt="" />
                        //<img className={SinglePostCSS.imgAvatar} src={`http://3.15.215.98:3001/images/`+postObject.ImageData} width="150" height="80" alt="" />
                          //http://3.143.203.151:3001<></>
                        :
                        <></>
                      }
                    </div>
                    <p>{postObject.firstname}</p>
                    
                </div>
            {authState.id === postObject.userID && (
              <i className="bi bi-trash" onClick={()=>{deletePost(postObject.id)}}></i>
            )}
          </div>
        </div>
        <div className={SinglePostCSS.addCommentContainer}>
          {commentSize == 100? <p className={SinglePostCSS.charLimit}>Character Limit Reached</p> : <p className={SinglePostCSS.hidden}>""</p>}
            <textarea
              type="text"
              placeholder="Comment.."
              value={newComment}
              onChange={(e) => {
                handleCommentChange(e);
              }}
              maxLength={100}
            />
            <p className={commentSize >= 80 ? SinglePostCSS.redInput : ""}>{commentSize}/100</p>
            <button onClick={addComment}>Add Comment</button>
          </div>
          <div className={SinglePostCSS.listOfComments}>
            {comments.slice(0).reverse().map((comment, key) => {
              return (
                <div key={key} className={SinglePostCSS.comment}>
                  

                    <div className={SinglePostCSS.commentBodyAndFooter}>
                      <div className={SinglePostCSS.commentBodyWrapper}>
                        <div className={SinglePostCSS.commentBody}>
                        {comment.commentBody}
                        </div>
                      
                      </div>
                      <div className={SinglePostCSS.commentFooter}>
                            <div className={SinglePostCSS.commentAvatarAndPic}>
                              <div className={SinglePostCSS.commentAvatar} onClick={()=> {
                                                  navigate(`/profile/${comment.userID}`);
                                                  window.location.reload()
                                                  }}>
                                {comment.ImageData?
                                //http://3.143.203.151:3001
                                  <img className={SinglePostCSS.imgAvatar} src={`http://localhost:3001/images/`+comment.ImageData} width="150" height="80" alt="" />
                                  //<img className={SinglePostCSS.imgAvatar} src={`http://3.15.215.98:3001/images/`+comment.ImageData} width="150" height="80" alt="" />
                                  :<></>
                                }
                              </div>
                              <div onClick={()=> {
                                            navigate(`/profile/${comment.userID}`);
                                            window.location.reload()
                                            }}
                              > {comment.firstname}
                              </div>
                            </div>
                              {authState.id === comment.userID && (
                                  <i className="bi bi-trash" onClick={() => {deleteComment(comment.id);}}>
                                  </i>
                              )}
                        </div>
                    </div>
                </div>
              );
            })}

        </div>
    </div>
  );
}

export default SinglePost;