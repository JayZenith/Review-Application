const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { validateToken } = require("./middleware/AuthMiddleWare");
const { sign } = require("jsonwebtoken");

const multer = require("multer");
const path = require("path");


require("dotenv").config();

const app = express();

app.use(cors());
// Middleware 
app.use(express.json()); //parse json bodies in request object
app.use(express.static('public'));


const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null, 'public/images')
  },
  filename: (req,file,cb)=>{
    cb(null, file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
})

const upload = multer({
  storage: storage
})


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
        createAvatarTable();
      });
    });
  });

  function createTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS posts (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt VARCHAR(30),
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          userID INT, 
          targetID INT,
          targetName VARCHAR(30),
          postText VARCHAR(500),
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
          userID INT, 
          bioText VARCHAR(500),
          profileLink VARCHAR(50)
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Bio Table created/exists");
      }
    );
  }

  function createAvatarTable() {
    db.query(
      `CREATE TABLE IF NOT EXISTS avatars (
          id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
          ImageData VARCHAR(200),
          userID INT 
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Avatar Table created/exists");
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
          firstname VARCHAR(30),
          lastname VARCHAR(30),
          fullname VARCHAR(60),
          password VARCHAR(100), 
          email VARCHAR(30)
      )`,
      (err) => {
        if (err) throw new Error(err);
        console.log("Users Table created/exists");
      }
    );
  }


  app.get("/auth", validateToken, (req, res) => {
    //console.log(req.user)
    res.json(req.user);

  });

  app.post("/posts", validateToken, (req, res) => {
    const post = req.body;
    var myDate = new Date()
    var pstDate = myDate.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles"
    })
    var time =pstDate.replace(/(.*)\D\d+/, '$1');
    //console.log(time);
    db.query(
      "INSERT INTO posts SET ?",
      {
        //title: post.title,
        postText: post.postText,
        //username: req.user.firstname,
        userID: req.user.id,
        targetID: post.id,
        targetName: post.username,
        rating: post.rating,
        createdAt: time,
        //created_at: created,
        
       // username: post.username,
      },
      (err) => {
        if (err) throw new Error(err);
        //console.log("1 post inserted");
        res.json(post);
      }
    );
  });

    app.post("/signupFour", (req, res) => {
      const user = req.body;
      //db.query(`SELECT * FROM users WHERE email='${user.email}' OR username='${user.user}'`, (err, result) => {
        db.query(`SELECT * FROM users WHERE email='${user.email}'`, (err, result) => {
        if (err) throw new Error(err);
        if (!result[0]) { //if no such user exists
          bcrypt.hash(user.pwd, 10).then((hash) => {
            db.query(
              "INSERT INTO users SET ?",
              {
                firstname: user.fname,
                lastname: user.lname,
                password: hash,
                email: user.email,
                fullname: user.fname + ' ' + user.lname,
              },
              (err, result) => {
                if (err) throw new Error(err);
                db.query(`SELECT * FROM users WHERE email='${user.email}'`, (err, result) => {
                  if(err) throw new Error;
                  
                  db.query(
                    "INSERT INTO avatars SET ?",
                    {
                      ImageData: "avatar.jpg", //default avatar
                      userID: result[0].id,
                    },
                    (err) => {
                      if (err) throw new Error(err);
                    }
                  )
                  const accessToken = sign(
                    {
                      email: user.email,
                      id: result[0].id,
                      firstname: user.fname,
                      lastname: user.lname,
                    },
                    process.env.ACCESS_TOKEN
                  );
                  res.json({
                    token: accessToken,
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    id: result[0].id,
                    email: user.email,
                  });
                })
              }
            );
          });
        } else {
          res.json({ error: "User with Email already exists!"});
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
                firstname: result[0].firstname,
                lastname: result[0].lastname,
              },
              process.env.ACCESS_TOKEN
            );
            res.json({
              token: accessToken,
              firstname: result[0].firstname,
              lastname: result[0].lastname,
              id: result[0].id,
              email: result[0].email,
            });
          }
        });
      }
    });
  });

  app.get("/users/:usern", (req, res) => {
    const name = req.params.usern;
    //console.log(name)
    db.query(`SELECT * FROM users WHERE username = '${name}'`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });


  app.get("/users", (req, res) => {
    const name = req.params.usern;
    //console.log(name)
    db.query(`SELECT * FROM users`, (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });
  

  app.get("/users2", (req, res) => {
    const name = req.params.usern;
    //console.log(name)
    db.query("SELECT users.*, avatars.ImageData "+
      "FROM users LEFT OUTER JOIN avatars ON "+
      "users.id=avatars.userID GROUP BY users.id, avatars.id", (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });

  app.get("/users3", (req, res) => {
    const name = req.params.usern;
    //console.log(name)
    db.query("SELECT users.*, avatars.ImageData, bio.bioText"+
      "FROM users LEFT OUTER JOIN avatars ON users.id=avatars.userID "+
      "LEFT JOIN bio ON users.id=avatars.userID GROUP BY users.id, avatars.id, bio.id", (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });

  app.get("/topusers", (req, res) => {
    const name = req.params.usern;
    //console.log(name)
    db.query("SELECT users.*, avatars.ImageData, SUM(rating) as ratingSum, "+
      "COUNT(distinct posts.id) as numOfReviews, SUM(rating)*1.0/COUNT(distinct posts.id) as theavg "+
      "FROM posts LEFT OUTER JOIN users ON posts.targetID=users.id "+
      "LEFT OUTER JOIN avatars ON posts.targetID=avatars.userID "+
      " WHERE date(posts.created_at)=date(now()) "+
      "GROUP BY posts.targetID, avatars.id, users.id "+
      "ORDER BY numOfReviews DESC", (err, result) => {
      if (err) throw new Error(err);
      res.json(result);
      //res.end();
    });
  });
  



  app.get("/posts4", validateToken, (req, res) => {
    //console.log(req.user.id)
    db.query(   
      "SELECT posts.*, count(distinct likes.id) as dt, avatars.ImageData, users.firstname, " +
      "users.lastname, users.email " +
      "FROM posts LEFT OUTER JOIN avatars ON posts.userID=avatars.userID " +
      "LEFT OUTER JOIN likes ON posts.id=likes.postID " +
      "LEFT OUTER JOIN users ON posts.userID=users.id GROUP BY posts.id, avatars.id, users.id",
      (err, result) => {
        if (err) throw new Error(err);
        db.query("SELECT posts.*, avatars.*, users.*"+
          "FROM posts LEFT OUTER JOIN avatars "+
          "ON posts.targetID=avatars.userID LEFT OUTER JOIN "+
          "users ON posts.targetID=users.id GROUP BY "+
          "posts.id, avatars.id, users.id",(err,result2)=>{
            if(err) throw new Error(err);
            //console.log(result)
            res.json({array1: result, array2:result2});
          })
        //res.json(result);
        
      }
    );
  
  });
  
  
  
  app.get("/singlePost/byId3/:id", (req, res) => {
    id = req.params.id;
    db.query(`SELECT posts.*, COUNT(distinct likes.id) as dt, `+
      `avatars.ImageData, users.* FROM posts LEFT OUTER JOIN avatars ON `+
      `posts.userID=avatars.userID LEFT JOIN likes ON posts.id=likes.postID `+
      `LEFT OUTER JOIN users ON posts.userID=users.id `+
      `WHERE posts.id=${id} GROUP BY posts.id, avatars.id, users.id`, (err, result) => {
      if (err) throw new Error(err);
      //console.log(result);
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


 


  app.get("/profilePosts/:id",(req,res)=>{
    id=req.params.id;
    db.query(`SELECT posts.*, COUNT(distinct likes.id) as dt, avatars.ImageData, users.firstname, users.email `+
       `FROM posts LEFT OUTER JOIN avatars ON posts.userID=avatars.userID `+
       `LEFT JOIN likes ON posts.id=likes.postID LEFT OUTER JOIN users ON posts.userID=users.id `+
       `WHERE targetID=${id} GROUP BY posts.id, avatars.id, users.id`,(err, result)=>{
      if(err) throw new Error(err);
      res.json(result)
    })
  })

  app.get("/reviewPosts6",(req,res)=>{
   
    db.query("SELECT posts.*, COUNT(distinct likes.id) as dt, avatars.ImageData, users.firstname, users.email "+
       "FROM posts LEFT OUTER JOIN avatars ON posts.userID=avatars.userID "+
       "LEFT JOIN likes ON posts.id=likes.postID LEFT OUTER JOIN users ON posts.userID=users.id "+
       "WHERE targetID IS NOT NULL GROUP BY posts.id, avatars.id, users.id",(err, result)=>{
      if(err) throw new Error(err);
      res.json(result)
    })
  })

  app.get("/justPosts6",(req,res)=>{
   
    db.query("SELECT posts.*, COUNT(distinct likes.id) as dt, avatars.ImageData, users.firstname, users.email "+
       "FROM posts LEFT OUTER JOIN avatars ON posts.userID=avatars.userID "+
       "LEFT JOIN likes ON posts.id=likes.postID LEFT OUTER JOIN users ON posts.userID=users.id "+
       "WHERE targetID IS NULL GROUP BY posts.id, avatars.id, users.id",(err, result)=>{
      if(err) throw new Error(err);
      res.json(result)
    })
  })


  app.get("/justReviews4", (req, res) => {
    //console.log(req.user.id)
    db.query(   
      "SELECT posts.*, count(distinct likes.id) as dt, avatars.ImageData, users.firstname, " +
      "users.lastname, users.email " +
      "FROM posts LEFT OUTER JOIN avatars ON posts.userID=avatars.userID " +
      "LEFT OUTER JOIN likes ON posts.id=likes.postID " +
      "LEFT OUTER JOIN users ON posts.userID=users.id "+
      "WHERE targetID is NOT NULL GROUP BY posts.id, avatars.id, users.id",
      (err, result) => {
        if (err) throw new Error(err);
        db.query("SELECT posts.*, avatars.*, users.*"+
          "FROM posts LEFT OUTER JOIN avatars "+
          "ON posts.targetID=avatars.userID LEFT OUTER JOIN "+
          "users ON posts.targetID=users.id "+
          " WHERE targetID is NOT NULL GROUP BY "+
          "posts.id, avatars.id, users.id",(err,result2)=>{
            if(err) throw new Error(err);
            //console.log(result)
            res.json({array1: result, array2:result2});
          })
        //res.json(result);
        
      }
    );
  
  });



  app.get("/comments3/:postId", (req, res) => {
    postId = req.params.postId;
    db.query(`SELECT comments.*, avatars.ImageData, users.* FROM comments LEFT OUTER JOIN `+
      `avatars ON comments.userID=avatars.userID LEFT OUTER JOIN users ON comments.userID=users.id `+
      `WHERE comments.postID=${postId} `+
      `GROUP BY comments.id, avatars.id, users.id`, (err, result) => {
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
        //console.log("1 comment inserted");
        //console.log(resp.insertId);
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
      db.query(`DELETE FROM comments WHERE postID=${deleteId}`,(err,result)=>{
        if(err) throw new Error(err);
      })
      //res.json(result)
    });
    res.json("deleted post");
  })

  
  /* USERS */





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
  //console.log("here",id);
  //db.query(`SELECT users.id, users.username, users.firstname, users.lastname, users.email FROM users WHERE id='${id}'`, (err,result)=>{
    db.query(`SELECT users.*, avatars.ImageData FROM users `+
      `LEFT OUTER JOIN avatars ON users.id=avatars.userID `+
      `WHERE users.id='${id}' GROUP BY users.id, avatars.id`, (err,result)=>{
    if(err) throw new Error(err);
    res.json(result);
  });
})


const fs=require('fs')

app.post("/upload", upload.single('image'), validateToken, (req,res)=>{
  const image = req.file.filename;
  //console.log([image])
  //db.query(`INSERT INTO avatars SET ImageData = ?`, [image], (err,result)=>{
  db.query(`SELECT * FROM avatars WHERE userID=${req.user.id}`,
    (err, result) => {
      if (err) throw new Error(err)
      if(!result[0]){ //if no user, insert 
        db.query(
          "INSERT INTO avatars SET ?",
          {
            ImageData: image,
            userID: req.user.id,
          },
          (err) => {
            if (err) throw new Error(err);
            res.json({Status:"Image Upload Success"})
          }
        )
      }else{ //Update the image in user section
        //console.log(result[0].ImageData);
        db.query(
          `UPDATE avatars SET ImageData=? WHERE userID=${req.user.id}`, [image],
          (err) => {
            if (err) throw new Error(err);
            if(result[0].ImageData != "avatar.jpg"){
              fs.unlink(`./public/images/${result[0].ImageData}`,(err)=>{
                if(err){
                  console.error(`Error removing file: ${err}`);
                  return;
                }
                //console.log(`File ${result[0].ImageData} has been successfully removed.`);
              })
            res.json({Status:"Image Upload Success"})
            }
          }
        )

      }
    })
    
  });

app.get("/getAvatar/:id", (req,res)=>{
  const id = req.params.id;
  db.query(`SELECT * from avatars WHERE userID=${id}`,(err,result)=>{
    if(err) throw new Error(err)
    res.json(result);
    //console.log(res);
  })
})


app.post("/addBio", validateToken, (req,res)=>{
    const { bioText} = req.body;
    const userID = req.user.id;
    db.query(`SELECT * FROM bio WHERE userID='${userID}'`, (err,result)=>{
      if (!result[0]) {
        db.query(`INSERT INTO bio SET ?`,
          {
            bioText: bioText,
            userID: userID,
          },
          (err)=>{
            if (err) throw new Error(err);
            res.json("Bio Created!")
            
          }
        )
      }
      else{
        //console.log(userID)
        db.query(`UPDATE bio 
          SET bioText='${bioText}' 
          WHERE userID='${userID}'`,
          (err)=>{
            if (err) throw new Error(err);
            res.json("Bio Updated!")
            //res.json("Bio Updated!")
          }
        )
      }
     
    })
    
})

app.post("/deleteUrlLink/:id", validateToken, (req, res) => {
  const id = req.params.id;
  db.query(`UPDATE bio SET profileLink=null WHERE id='${id}'`,(err, result) => {
    if (err) throw new Error(err);
    //res.json(result)
  });
  res.json("deleted url");
});


app.post("/addUrlLink", validateToken, (req,res)=>{
  const {urlLink} = req.body;
  const userID = req.user.id;
  db.query(`SELECT * FROM bio WHERE userID='${userID}'`, (err,result)=>{
    if (!result[0]) {
      db.query(`INSERT INTO bio SET ?`,
        {
          profileLink: urlLink,
          userID: userID,
        },
        (err)=>{
          if (err) throw new Error(err);
          res.json("Link Created!")
          
        }
      )
    }
    else{
      //console.log(userID)
      db.query(`UPDATE bio 
        SET profileLink='${urlLink}' 
        WHERE userID='${userID}'`,
        (err)=>{
          if (err) throw new Error(err);
          res.json("Link Updated!")
          //res.json("Bio Updated!")
        }
      )
    }
   
  })
  
})


app.get("/getBio/:id", (req,res)=>{
  const id = req.params.id;
  db.query(`SELECT * FROM bio WHERE userID='${id}'`, (err,result)=>{
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
  console.log(req.user.id)
  db.query(`DELETE FROM users WHERE email='${req.user.email}'`, (err,result) => {
    if (err) throw new Error(err);
    db.query(`DELETE FROM posts where userID=${req.user.id}`,(err,result)=>{
      if (err) throw new Error(err);
      db.query(`DELETE FROM posts where targetID=${req.user.id}`,(err,result)=>{
        if (err) throw new Error(err);
        db.query(`DELETE FROM likes where userID=${req.user.id}`,(err,result)=>{
          if (err) throw new Error(err);
          db.query(`DELETE FROM comments where userID=${req.user.id}`,(err,result)=>{
            if (err) throw new Error(err);
            res.json(result);
          })
        })
      })
    })
  });
})



app.put("/changepassword", validateToken, (req,res) => {
  const {oldPassword, newPassword} = req.body;
  db.query(`SELECT * FROM users WHERE email='${req.user.email}'`, (err, result) => {
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
              `UPDATE users SET password='${hash}' WHERE email='${req.user.email}'`,
              //{
                //username: user.user,
                //password: hash,
                //email: user.email,
              //},
              (err) => {
                if (err) throw new Error(err);
                res.json("Password Updated!")
                //console.log("password updated");
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
  