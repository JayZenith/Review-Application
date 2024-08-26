const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { validateToken } = require("./middleware/AuthMiddleWare");
const { sign } = require("jsonwebtoken");