const express = require('express');
var mongodb = require('mongodb');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
app.use(bodyParser.json());
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');
var redis = require("redis")
const CryptoJS = require('crypto-js')
app.use(cookieParser());
app.use(cors());

/* const cluster = redis.createCluster({
  rootNodes: [
      {
          url: 'redis://127.0.0.1:7000'
      },
      {
          url: 'redis://127.0.0.1:7001'
      },
      {
          url: 'redis://127.0.0.1:7002'
      },
      // ...
  ],
  useReplicas: true,
  minimizeConnections: true, //When true, .connect() will only discover the cluster topology, without actually connecting to all the nodes. Useful for short-term or Pub/Sub-only connections.
  defaults: {
      username: 'ianjhh',
      password: 'ijh21999',
  } 
}).on('error', (err) => console.log('Redis Cluster Error', err)); */



const createBloomFilter = async () =>{
}

var MongoClient = require('mongodb').MongoClient;
const client = new MongoClient("mongodb+srv://ianjhh:ijh21999@imgupload.l8bfttd.mongodb.net/?retryWrites=true&w=majority&appName=imgupload");

const database = client.db('imgupload');
const credentials = database.collection('credentials');
const quiz = database.collection('quiz');
const game = database.collection('game');
const animalFact = database.collection('animalFact');
const spaceFact = database.collection('spaceFact');
const historyFact = database.collection('historyFact');

/* NODEMAILER */
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "ianjh.102@gmail.com",
    pass: "wstl waad oxia gttw",
  },
});

app.get('/api/', async (req, res) => {
    console.log('hello world')
})

app.post('/api/validateEmail', async (req, res) => {
  try{
      /* check whether email exists in bloom filter */
    
        let emailArr = await credentials.find({}, {_id: 0, email: 1}).toArray();
        const cluster = redis.createCluster({
          rootNodes: [
              {
                  url: 'redis://redis:ijh21999ijh21999!@127.0.0.1:7000'
              },
              {
                  url: 'redis://redis:ijh21999ijh21999!@127.0.0.1:7001'
              },
              {
                  url: 'redis://redis:ijh21999ijh21999!@127.0.0.1:7002'
              },
              // ...
          ],
          useReplicas: true,
          minimizeConnections: true, //When true, .connect() will only discover the cluster topology, without actually connecting to all the nodes. Useful for short-term or Pub/Sub-only connections.
          defaults: {
              username: 'redis',
              password: 'ijh21999ijh21999!',
          },
        }).on('error', (err) => console.log('Redis Cluster Error', err));
    
        await cluster.connect();

        // Delete any pre-existing Bloom Filter
        await cluster.del('emailBloom');

        // Reserve/Create(same meaning) a Bloom Filter with configurable error rate and capacity
        await cluster.bf.reserve('emailBloom', 0.01, 1000);
        console.log('Reserved Bloom Filter.');

        // Add multiple items to Bloom Filter at once with BF.MADD command
        await cluster.bf.mAdd('emailBloom', ['ianjhhhhh@gmail.com']);

        const emailExists = await cluster.bf.exists('emailBloom', req.body.email);
        console.log(emailExists)
        if(emailExists){
            res.status(409).send('Email exists already!');
        }
        else{
            res.status(200).send('Email does not exist! You can use that email!');
        }
    }
  catch (e) {
        if (e.message.endsWith('item exists')) {
            console.log('Bloom Filter already reserved.');
        } 
        else {
            console.log('Error, maybe RedisBloom is not installed?:');
            console.log(e);
        }
    }
})

app.post('/api/login', async (req, res) => {
  try{
    let result = await credentials.findOne({username: req.body.username});
    if(!result){
      res.status(404).send('Not found!');
    }
    else{
    bcrypt.compare(req.body.password, result.password, function(err, result) {
      if(result!==true){
          res.status(404).send('Not found!')
      }
      else{
          jwt.sign({username: req.body.username}, 'privatekey', { expiresIn: '1h' },(err, token) => {
            if(err) { 
                res.status.send('Error!')
            }
          res.status(200).cookie('jwt', token).send('Successful!');
      });
      }
    });
  }
}
  catch(e){
    console.log(e)
    res.status(400).send('Error!')
  }
})

app.post('/api/register', async (req, res) => {
    try{
      let data = req.body;
      let found = await credentials.findOne({username: data.username});

      if (found){
          res.status(404).send('User already registered!');
      }
          var text = data.username;
          var key = CryptoJS.enc.Utf8.parse('b75524255a7f54d2726a951bb39204df');
          var iv  = CryptoJS.enc.Utf8.parse('1583288699248111');

          var enc_username= CryptoJS.AES.encrypt(text, key, {iv: iv});
          enc_username = enc_username.toString();

          const mailOptions = {
            from: "ianjhh.102@gmail.com",
            to: req.body.email,
            subject: "Verify your account for WebsiteName by clicking the link below",
            text: `https://kuisanak.com/verify?q=${enc_username}`
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email: ", error);
            } else {
              console.log("Email sent: ", info.response);
            }
          })
      
      await credentials.insertOne(data);
      res.status(200).json(data);
    }
    catch(e){
      res.status(400).send('Error!')
    }
})

app.get('/api/homepage', async (req, res) => {
    if(!req.cookies.jwt){
      res.status(400).send('No valid authentication token, try logging in again')
    }
    else{
        jwt.verify(req.cookies.jwt, 'privatekey', async (err, authorizedData) => {
          if(err){
              //If error send Forbidden (403)
              console.log(err)
              res.status(403);
          } else {
              let found = await credentials.findOne({username: authorizedData.username}, {verified:1, _id:0});
              if(found){
                  if(found.verified!== true){
                      res.status(400).send('Not verified!');
                  }
                  else{
                      console.log('verified!')
                      //If token is successfully verified, we can send the authorized data 
                        res.status(200).json({
                          message: 'Successful log in',
                          authorizedData
                      });
                  }
              }
          }
        })
    }
})

app.get('/api/verifyToken', async (req, res) => {
    if(!req.cookies.jwt){
      res.status(400).send('error')
    }
    else{
        jwt.verify(req.cookies.jwt, 'privatekey', (err, authorizedData) => {
          if(err){
              //If error send Forbidden (403)
              console.log(err)
              res.status(403).send('error');
          } else {
              //If token is successfully verified, we can send the authorized data 
              res.status(200).json({
                  message: 'Successful log in',
                  authorizedData
              });
          }
        })
    }
})

app.post('/api/fetchQuiz', async (req, res) => {
    try{
        let result = await quiz.findOne({name: req.body.name });
        res.status(200).json(result);
    }
    catch(e){
        console.log(e)
        res.status(400).send('Error!')
    }
})

app.get('/api/fetchAnimalQuiz', async (req, res) => {
  try{
      let result = await quiz.find({category: 'animal'}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchMathQuiz', async (req, res) => {
  try{
      let result = await quiz.find({category: 'math'}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchMiscellaneousQuiz', async (req, res) => {
  try{
      let result = await quiz.find({category: 'miscellaneous'}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchLanguageQuiz', async (req, res) => {
  try{
      let result = await quiz.find({category: 'language'}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchAnimalFacts', async (req, res) => {
  try{
      let result = await animalFact.find({}).project({factsarr: 0}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/fetchAnimalFact', async (req, res) => {
  try{
      let result = await animalFact.findOne({link_name: req.body.link_name});
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchSpaceFacts', async (req, res) => {
  try{
      let result = await spaceFact.find({}, {factsarr: 0}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/fetchSpaceFact', async (req, res) => {
  try{
      let result = await spaceFact.findOne({link_name: req.body.link_name});
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchRandomFacts', async (req, res) => {
  try{
      let result = await historyFact.find({}, {factsarr: 0}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/fetchRandomFact', async (req, res) => {
  try{
      let result = await historyFact.findOne({link_name: req.body.link_name});
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/fetchHistory', async (req, res) => {
  try{
      let result = await credentials.findOne({username: req.body.username}, {"history":1, "_id":0});
      res.status(200).json(result.history);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/fetchAllGames', async (req, res) => {
  try{
      let result = await game.find({}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/fetchGame', async (req, res) => {
  try{
      let result = await game.findOne({name: req.body.gameName});
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/setVerified', async (req, res) => {
  try{
      let result = await credentials.updateOne({username: req.body.username}, {$set: {verified: true}, $unset: {createdAt: ""}});
      if(!result){
        res.status(404).send('Not found!');
      }
      else{
            jwt.sign({username: req.body.username}, 'privatekey', { expiresIn: '1h' },(err, token) => {
              if(err) { 
                  res.status.send('Error!')
              }
            res.status(200).cookie('jwt', token).send('Successful!');
        });
      }
  }   
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/logout', async (req, res) => {
    try{
        res.status(202).clearCookie('jwt').send('cookie cleared')
    }
    catch(e){
        res.status(400).send('error')
    }
})

app.post('/api/quizHistory', async (req, res) => {
  try{
      let result = await credentials.updateOne({ username: req.body.username }, 
        {$push: {
            history: {
                $each: [[req.body.quizname, req.body.score]],
                $slice: 10
            }
        }});
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.listen(5000, () => {
  console.log(`App listening on port 5000`)
})
