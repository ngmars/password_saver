const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const bcrypt= require('bcryptjs')
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const app = express()

app.use(cors())
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Header','Origin,X-Requested-with,Content-Type,Accept,Authorization');
    
    if(req.method=='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, GET, DELETE');
        return res.status(200).json({});
    }
    next();
});

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'passwordSaver'
})


app.use((error, req,res,next)=>{
    console.log(error);
    const status= error.statusCode || 500;
    const message = error.message;
    const data= error.data;
    res.status(status).json({message: message, data: data})
})

app.get('/',(req,res)=>{
    res.status(200).json({message:'Server works!'})
})

app.post('/app/sites',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            res.status(500).json({message:err})
        }
        else{
            console.log('connected as id ' + connection.threadId)
            const userid = req.body.userid;
            const username=req.body.username;
            const password=req.body.password;
            const website=req.body.website;
            
            bcrypt.hash(password,12).then(hashedPw=>{
                const query = `INSERT INTO savedpasswords (user_id,username,password,website) VALUES('${userid}','${username}','${hashedPw}','${website}')`
                connection.query(query,(err,rows)=>{
                    if(err){
                        res.status(500).json({message:err})
                    }
                    else{
                        res.status(201).json({message:rows});
                    }
                    connection.release();
                })
            })    
        }
    })

})

app.get('/app/sites/list',(req,res)=>{
    pool.getConnection((err,connection)=>{
        if(err){
            res.status(500).json({message:err})
        }
        else{
            const userid = req.body.userid;
            const query = `SELECT * FROM savedpasswords WHERE user_id=${userid}`;
            connection.query(query,(err,rows)=>{
                if(err){
                    res.status(500).json({message:err})
                }
                else{
                    res.status(200).json({message:rows});
                }
                connection.release();
            })
        }
    })
    
})
module.exports = app;

