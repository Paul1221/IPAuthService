var express = require('express');
var jwt = require('jsonwebtoken');
var app = express();
var secret = 'harrypotter';
app.use(express.json());
var mongoose = require('mongoose');
var nodemailer=require('nodemailer');
//const path = require('path');
//const bodyParser = require('body-parser');

const User = require('./user');

let transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
          user:'arhire.paul@gmail.com',
          pass:'Paulefrumos'
  }

});

mongoose.Promise=global.Promise;
var db = mongoose.connect(process.env.MONGODB_URI||'mongodb+srv://Paul:Paul2000@authorizationdb-d48im.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true ,useUnifiedTopology: true },function(err,response){
    if(err){
        console.log(err);
    }else{
        console.log('Connected to database');
    }
});


app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,content-type,Accept');
    next();
});

app.get("/dbAPI/getUserByEmail/:emailadress",function(req,res){
    User.findOne({email:req.params.emailadress})
    .then((user)=>res.send(user))
    .catch((error)=>res.send(error));
});
app.get("/dbAPI/getUserByUsername/:username",function(req,res){
    User.findOne({username:req.params.username})
    .then((user)=>res.send(user))
    .catch((error)=>res.send(error));
});
app.get("/dbAPI/getUsers",function(req,res){
    User.find({})
    .then((user)=>res.send(user))
    .catch((error)=>res.send(error));
});

app.get("/dbAPI/isUsernameValid/:username",function(req,res){
    User.find({username:req.params.username},{username:1,_id:0})
    .then((user)=>res.send(user))
    .catch((error)=>res.send(error));
});


app.post("/dbAPI/addUser",function(req,res){
    (new User({
        'email':req.body.email,
        'username':req.body.username,
        'password':req.body.password,
        'temporaryToken':jwt.sign({email:req.body.email,username:req.body.username},secret,{expiresIn:'1d'})
    }))
    .save()
    .then((user)=>{
        res.send(user);
        let mailOptions = {
            from:'arhire.paul@gmail.com',
            to:user.email,
            subject:'test',
            text:'Salut ' + user.username + ' Te rog apasa pe urmatorul link pentru a confirma inregistrarea https://auth-service-ip.herokuapp.com/activation/'+user.temporaryToken
        };

        transporter.sendMail(mailOptions,function(err,data){
            if(err){
                console.log(err);
            }
        });
    })
    .catch((err)=>console.log(err));
});

app.get("/dbAPI/passRecover/:email",function(req,res){
  User.findOne({email:req.params.email})
  .then((user)=>{
    res.send(user);
    let mailOptions = {
      from: 'arhire.paul@gmail.com',
      to:user.email,
      subject: 'Recuperare parola',
      text: 'Salut ' + user.username + ' parola ta este: ' + user.password
    }
    transporter.sendMail(mailOptions,function(err,data){
      if(err){
          console.log(err);
      }
    });
  })
  .catch((err)=>console.log(err));
});

app.post("/dbAPI/addSocialUser",function(req,res){
    (new User({
        'email':req.body.email,
        'username':req.body.username,
        'password':req.body.password,
        'active':true
    }))
    .save()
    .then((user)=>{
        res.send(user);
        let mailOptions = {
            from:'arhire.paul@gmail.com',
            to:user.email,
            subject:'test',
            text:'Salut ' + user.username + ' parola ta este: '+user.password
        };

        transporter.sendMail(mailOptions,function(err,data){
            if(err){
                console.log(err);
            }
        });
    })
    .catch((err)=>console.log(err));
});

app.get('/activation/:token',function(req,res){
    User.findOne({temporaryToken:req.params.token})
    .then((user)=>{
        var token = req.params.token;
        jwt.verify(token,secret,function(err,decoded){
            if(err){
                res.json({succes:false , message:'Link ul de activare a expirat'});
            }else if(!user){
                res.json({succes:false , message:'Link ul de activare a expirat'});
            }
            else{
                user.temporaryToken=false;
                user.active=true;
                user.save(function(err){
                    if(err) console.log(err);
                });
                profileToken=jwt.sign({email:user.email,username:user.username},secret,{expiresIn:'1d'});
                res.redirect(`http://localhost:4200/profileCreation/`+profileToken);
            }
        });

    })


});

app.post('/dbAPI/createPatientProfile/:token',function(req,res){
    var token = req.params.token;
    jwt.verify(token,secret,function(err,decoded){
        if(err){
            res.json({succes:false , message:'Link ul de creare profil a expirat'});
        }
        else{
           User.findOneAndUpdate({'email':decoded.email},{$set:req.body})
            .then((user)=>res.send(user))
            .catch((err)=>console.log(err));
            
        }
    });
    
});

app.get('/login/:username' , function(req,res){
    User.findOne({username:req.params.username}).then(
        (user)=>{
            token=jwt.sign({email:user.email,username:user.username,id:user._id},secret,{expiresIn:'1d'});
            res.send({token:token});
        }
    );
});

app.post('/dbAPI/setGeolocation/:username',function(req,res){
    User.findOneAndUpdate({'username':req.params.username},{$set:req.body})
    .then((user)=>res.send(user))
    .catch((err)=>console.log(err));
});


app.get("/dbAPI/diagnosisInfo/:username",function(req,res){
    User.findOne({username:req.params.username},{longitude:1,latitude:1})
    .then((user)=>{
        res.send(user);
    })
    .catch((error)=>res.send(error));
});

app.get("/dbAPI/recomandationInfo/:username",function(req,res){
    User.findOne({username:req.params.username},{name:1 , surname:1 , medicalHistory:1,age:1,sex:1,homeStreet:1,homeCity:1, homeCountry:1,homeStreetNr:1 , homeNumber:1 , email:1 })
    .then((user)=>{
        res.send(user);
    })
    .catch((error)=>res.send(error));
});

app.get("/dbAPI/specializtionInfo/:username",function(req,res){
    User.findOne({username:req.params.username},{type:1,specializations:1,cabintetStreet:1,cabintetCity:1,cabinetCountry:1,age:1,name:1,surname:1,email:1,workNumber:1,disponibility:1,hospitalName:1})
    .then((user)=>{
        res.send(user);
    })
    .catch((error)=>res.send(error));
});

app.get("/dbAPI/medicamentationInfo/:username",function(req,res){
    User.findOne({username:req.params.username})
    .then((user)=>{
        res.send(user);
    })
    .catch((error)=>res.send(error));
});

app.get('/',function(req,res){

  res.send("hello");
});



var PORT = process.env.PORT||8000;


app.listen(PORT,function(){
   console.log("Server started at port: "+PORT);
});
