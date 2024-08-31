import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "../helpers/AuthContext";

function SinglePost() {
  let { id } = useParams();
  const [postObject, setPostObject] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const { authState } = useContext(AuthContext);

  let navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:3001/singlePost/byId2/${id}`)
      .then((response) => {
        setPostObject(response.data[0]);
      });
    axios.get(`http://localhost:3001/comments2/${id}`).then((response) => {
      setComments(response.data);
    });
  }, [comments]); //did this fix problem of having to rerender upon create/delete comment??
//thought is rerender any change to comments and abovce gets send back comment details
  const addComment = () => {
    axios
      .post(
        "http://localhost:3001/comments",
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
            username: res.data.username,
            id: res.data.id,
          };
          setComments([...comments, commentToAdd]);
          setNewComment(""); //to make the newComment value empty within input
        }
      });
  };

  const deleteComment = (id) => {
    axios.delete(`http://localhost:3001/deleteComment/${id}`, {
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
    <div className="singlePostPage">
        <div className="theSinglePost" id="individual">
          <div className="singlePostBody">{postObject.postText}</div>
          <div className="singlePostFooter">
                <div className="singlePostUsername" onClick={()=> {
                                navigate(`/profile/${postObject.userID}`);
                                window.location.reload()
                                }}
                >
                    <div className="singlePostAvatar">
                      {postObject.ImageData? 
                        <img className='imgAvatar' src={`http://localhost:3001/images/`+postObject.ImageData} width="150" height="80" alt="" />
                          //<></>
                        :
                        <></>
                      }

                    </div>
                    {postObject.username}
                </div>
            {authState.username === postObject.username && (
              <i className="bi bi-trash" onClick={()=>{deletePost(postObject.id)}}></i>
            )}
          </div>
        </div>
          <div className="addCommentContainer">
          {commentSize == 100? <p>Character Limit Reached</p> : ""}
            <textarea
              type="text"
              placeholder="Comment.."
              value={newComment}
              onChange={(e) => {
                handleCommentChange(e);
              }}
              maxLength={100}
            />
            <p>{commentSize}/100</p>
            <button onClick={addComment}>Add Comment</button>
          </div>
          <div className="listOfComments">
            {comments.slice(0).reverse().map((comment, key) => {
              return (
                <div key={key} className="comment">
                  <div className="singlePostAvatar">
                      {comment.ImageData? 
                        <img className='imgAvatar' src={`http://localhost:3001/images/`+comment.ImageData} width="150" height="80" alt="" />
                          //<></>
                        :
                        <></>
                      }

                    </div>
                  <div className="commentBody">
                  {comment.commentBody}
                  </div>
                
                 <div className="commentFooter">
                  <div onClick={()=> {
                                navigate(`/profile/${comment.userID}`);
                                window.location.reload()
                                }}
                  > {comment.username} </div>
                    {authState.username === comment.username && (
                        <i className="bi bi-trash" onClick={() => {deleteComment(comment.id);}}>
                        </i>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
    </div>
  );
}

export default SinglePost;