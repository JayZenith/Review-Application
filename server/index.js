const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { validateToken } = require("./middleware/AuthMiddleWare");
const { sign } = require("jsonwebtoken");

require("dotenv").config();

const app = express();

app.use(cors());
// Middleware 
app.use(express.json()); //parse json bodies in request object

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: "", //have to do this as or else Unknown Database
    password: process.env.DB_PASSWORD,
});
  

db.connect((err) => {
    if (err) throw err;
    console.log("mysql db Connected...");
    db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err, result) => {
      if (err) throw new Error(err);
      console.log("Database created/exists");
      db.changeUser({ database: process.env.DB_NAME }, (err) => {
        if (err) throw new Error(err);
        createTable();
        createUsersTable();
        createCommentTable();
        createLikesTable();
        createBioTable();
      });
    });
  });

  function createTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          postID INT,
          userID INT, 
          targetID INT,
          targetName VARCHAR(30),
          title VARCHAR(30),
          postText VARCHAR(500),
          username VARCHAR(30),
          rating INT
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Post Table created/exists");
      }
    );
  }


  function createBioTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS bio (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          bioText VARCHAR(500)
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Bio Table created/exists");
      }
    );
  }
  
  function createLikesTable(){
    db.query(`CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
        postID INT,
        userID INT
    )`, (err) =>{
        if (err) throw new Error(err);
        console.log("Likes Table created/exists");
    });
}

  function createCommentTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS comments (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          commentID INT,
          postID INT,
          userID INT, 
          username VARCHAR(30),
          commentBody VARCHAR(100)
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Comment Table created/exists");
      }
    );
  }
  
  /*Password needs to be long enough to hash password */
  function createUsersTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          username VARCHAR(30),
          password VARCHAR(100), 
          email VARCHAR(30)
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Users Table created/exists");
      }
    );
  }

  /*
  res.json({ token: accessToken,
               username: result[0].username,
               id: result[0].id,
               email: user.email,
  });  CREATED FROM SIGNING UP 
  */

  app.get("/auth", validateToken, (req, res) => {
    res.json(req.user);
  });


  app.post("/signupThree", (req, res) => {
    const user = req.body;
    db.query(`SELECT * FROM users WHERE email='${user.email}' OR username='${user.user}'`, (err, result) => {
      if (err) throw new Error(err);
      //console.log(result);
      if (!result[0]) { //if no such user exists
        bcrypt.hash(user.pwd, 10).then((hash) => {
          db.query(
            "INSERT INTO users SET ?",
            {
              username: user.user,
              password: hash,
              email: user.email,
            },
            (err, result) => {
              if (err) throw new Error(err);
              //console.log("1 user inserted");
              //console.log(result[0]);
              db.query(`SELECT * FROM users WHERE email='${user.email}'`, (err, result) => {
                if(err) throw new Error;
                //console.log(result[0]);
  
                const accessToken = sign(
                  {
                    email: user.email,
                    id: result[0].id,
                    username: result[0].username,
                  },
                  process.env.ACCESS_TOKEN
                );
                res.json({
                  token: accessToken,
                  username: result[0].username,
                  id: result[0].id,
                  email: user.email,
                });
              })
            }
          );
        });
      } else {
        //console.log("user exist")
        res.json({ error: "User already exists!"});
      }
    }); //end of Select Query
    //res.json("success");
  });
  
  app.post("/login", (req, res) => {
    const user = req.body;
    let sql = `SELECT * FROM users WHERE email='${user.email}'`;
    db.query(sql, (err, result) => {
      if (err) throw new Error(err);
      //res.json(!result[0]);
      if (!result[0]) {
        res.json({ error: "User dosen't exist" });
      } else {
        bcrypt.compare(user.password, result[0].password).then((match) => {
          if (!match)
            res.json({ error: "wrong username and password combination" });
          else {
            const accessToken = sign(
              {
                email: user.email,
                id: result[0].id,
                username: result[0].username,
              },
              process.env.ACCESS_TOKEN
            );
            res.json({
              token: accessToken,
              username: result[0].username,
              id: result[0].id,
              email: user.email,
            });
          }
        });
      }
    });
  });

  app.get("/users/:usern", (req, res) => {
    const name = req.params.usern;
    console.log(name)
    db.query(`SELECT * FROM users WHERE username = '${name}'`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });


  app.get("/users", (req, res) => {
    const name = req.params.usern;
    console.log(name)
    db.query(`SELECT * FROM users`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });
  
  
  
  

  app.get("/posts", validateToken, (req, res) => {
    //console.log(req.user.id)
    db.query(
      "select posts.title, posts.targetID, posts.targetName, posts.postText, posts.username, posts.id, posts.userID, count(distinct likes.id) as dt from posts left join likes on posts.id = likes.postID group by posts.id",
      (err, result) => {
        if (err) throw new Error(err);
        //console.log(result[0].dt);
        db.query(
          `select posts.id from posts inner join likes on posts.id=likes.postID inner join users on ${req.user.id} = likes.userID`,
          (err, resultant) => {
              if(err) throw new Error(err);
              //console.log(resultant);
              resultant = resultant.filter((value, index, self) =>
                index === self.findIndex((t) => (
                  t.id === value.id 
                ))
              )
              res.json({ listOfPosts: result, userLikes: resultant });
          }
        )
        //const userLikes = 10;
        //res.json({ listOfPosts: result, userLikes: userLikes });
        //res.json(result);
        //res.end();
      }
    );
  
  });


  app.post("/posts", validateToken, (req, res) => {
    const post = req.body;
    console.log(post.rating)
    db.query(
      "INSERT INTO posts SET ?",
      {
        //title: post.title,
        postText: post.postText,
        username: req.user.username,
        userID: req.user.id,
        targetID: post.id,
        targetName: post.username,
        rating: post.rating,
        
       // username: post.username,
      },
      (err) => {
        if (err) throw new Error(err);
        console.log("1 post inserted");
        res.json(post);
      }
    );
  });
  
  
  app.get("/singlePost/byId/:id", (req, res) => {
    id = req.params.id;
    db.query(`SELECT * FROM posts WHERE id = ${id}`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });

  
  app.get("/byuserId/:id", (req, res) => {
    id = req.params.id;
    //db.query(`SELECT * FROM posts WHERE userID = ${id}`, (err, result) => {
      db.query(
        `select posts.title, posts.rating, posts.postText, posts.username, posts.id, posts.targetID, posts.userID, count(distinct likes.id) as dt from posts left join likes on posts.id = likes.postID group by posts.id`,
        (err, result) => {
      if (err) throw new Error(err);
      //res.json(result);
        db.query(
          `select posts.id from posts inner join likes on posts.id=likes.postID inner join users on ${id} = likes.userID`,
          (err, resultant) => {
              if(err) throw new Error(err);
              //console.log(resultant);
              resultant = resultant.filter((value, index, self) =>
                index === self.findIndex((t) => (
                  t.id === value.id 
                ))
              )
              res.json({ listOfPosts: result, userLikes: resultant });
          }
        )
      //res.end();
    });
  });



  app.get("/comments/:postId", (req, res) => {
    postId = req.params.postId;
    db.query(`SELECT * FROM comments WHERE postID = ${postId}`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });
  
  app.post("/comments", validateToken, (req, res) => {
    const cmt = req.body;
    const userName = req.user.username;
    db.query(
      "INSERT INTO comments SET ?",
      {
        commentBody: cmt.commentBody,
        postID: cmt.postID,
        username: userName,
        userID: cmt.userID,
      },
      (err, resp) => {
        if (err) throw new Error(err);
        console.log("1 comment inserted");
        console.log(resp.insertId);
        res.json({
          commentBody: cmt.commentBody,
          postID: cmt.postID,
          username: userName,
          id: resp.insertId,
        });
      }
    );
  });



  app.delete("/deleteComment/:commentId", validateToken, (req, res) => {
    const commentID = req.params.commentId;
    db.query(`DELETE FROM comments WHERE id=${commentID}`, (err, result) => {
      if (err) throw new Error(err);
      //res.json(result)
    });
    res.json("deleted comment");
  });
  
  app.delete("/deletePost/:deleteId", validateToken, (req,res)=>{
    const deleteId = req.params.deleteId;
    db.query(`DELETE FROM posts WHERE id=${deleteId}`, (err, result) => {
      if (err) throw new Error(err);
      //res.json(result)
    });
    res.json("deleted post");
  })

  
  /* USERS */

app.post("/signup", (req, res) => {
  const user = req.body;
  bcrypt.hash(user.pwd, 10).then((hash) => {
    db.query(
      "INSERT INTO users SET ?",
      {
        username: user.user,
        password: hash,
        email: user.email,
      },
      (err) => {
        if (err) throw new Error(err);
        console.log("1 user inserted");
      }
    );
  });
  res.json("success");
});

app.post("/signupTwo", (req, res) => {
  const user = req.body;
  db.query(`SELECT * FROM users WHERE email='${user.email}'`, (err, result) => {
    if (err) throw new Error(err);
    console.log(result);
    if (!result[0]) {
      //res.json({ error: "User dosen't exist" });
      bcrypt.hash(user.pwd, 10).then((hash) => {
        db.query(
          "INSERT INTO users SET ?",
          {
            username: user.user,
            password: hash,
            email: user.email,
          },
          (err, result) => {
            if (err) throw new Error(err);
            console.log("1 user inserted");
            console.log(result[0]);
            db.query(`SELECT * FROM users WHERE email='${user.email}'`, (err, result) => {
              if(err) throw new Error;
              console.log(result[0]);

              const accessToken = sign(
                {
                  email: user.email,
                  id: result[0].id,
                  username: result[0].username,
                },
                process.env.ACCESS_TOKEN
              );
              res.json({
                token: accessToken,
                username: result[0].username,
                id: result[0].id,
                email: user.email,
              });


            })
          }
        );
      });
    } else {
      //console.log("user exist")
      res.json({ error: "User already exists!"});
    }
  }); //end of Select Query
  //res.json("success");
});


app.post("/", (req, res) => {
  const user = req.body;
  let sql = `SELECT * FROM users WHERE username='${user.username}'`;
  db.query(sql, (err, result) => {
    if (err) throw new Error(err);
    //res.json(!result[0]);
    if (!result[0]) {
      res.json({ error: "User dosen't exist" });
    } else {
      bcrypt.compare(user.password, result[0].password).then((match) => {
        if (!match)
          res.json({ error: "wrong username and password combination" });
        else res.json("YOU LOGGGED IN!");
      });
    }
  });
});


app.get("/basicInfo/:id", (req,res) => {
  const id = req.params.id;
  db.query(`SELECT users.id, users.username, users.email FROM users WHERE id='${id}'`, (err,result)=>{
    if(err) throw new Error(err);
    res.json(result);
  });
})




/*LIKES*/
app.post("/likes", validateToken, (req, res) => {
  const { postID } = req.body;
  const userID = req.user.id;
  db.query(
    `SELECT * FROM likes WHERE userID='${userID}' AND postID='${postID}'`,
    (err, result) => {
      if (err) throw new Error(err);
      if (!result[0]) {
        db.query(
          "INSERT INTO likes SET ?",
          {
            postID: postID,
            userID: userID,
          },
          (err) => {
            if (err) throw new Error(err);
            //res.json("Liked");
            res.json({liked: true});
          }
        );
      } else {
        db.query(
          `DELETE FROM likes WHERE userID='${userID}' AND postID='${postID}'`,
          (err, result) => {
            if (err) throw new Error(err);
            //res.json("Unliked");
            res.json({liked: false});
          }
        );
      }
    }
  );
});


app.delete("/deleteAccount", validateToken, (req,res)=>{
  db.query(`DELETE FROM users WHERE username='${req.user.username}'`, (err,result) => {
    if (err) throw new Error(err);
    res.json(result);
  });
})



app.put("/changepassword", validateToken, (req,res) => {
  const {oldPassword, newPassword} = req.body;
  db.query(`SELECT * FROM users WHERE username='${req.user.username}'`, (err, result) => {
    if (err) throw new Error(err);
    //res.json(!result[0]);
    if (!result[0]) {
      res.json({ error: "User dosen't exist" });
    } else {
      bcrypt.compare(oldPassword, result[0].password).then((match) => {
        if (!match)
          res.json({ error: "wrong password entered" });
        else {
          bcrypt.hash(newPassword, 10).then((hash) => {
            db.query(
              `UPDATE users SET password='${hash}' WHERE username='${req.user.username}'`,
              //{
                //username: user.user,
                //password: hash,
                //email: user.email,
              //},
              (err) => {
                if (err) throw new Error(err);
                console.log("password updated");
              }
            );
          });
          
        }
      });
    }
  });
})






const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`listening server.js on PORT ${PORT}`);
  });
  