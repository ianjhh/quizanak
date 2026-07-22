try {
  require('dotenv').config();
} catch (e) {
  // Dotenv is optional in production where variables are set directly in host dashboard
}
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
var redis = require("redis");
const CryptoJS = require('crypto-js');
const crypto = require('crypto');
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:3000',
  'https://kuisanak.com',
  'https://ianjhh-portfolio.netlify.app',
  'https://ianjhh.github.io'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.netlify.app') || origin.endsWith('.github.io')) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
    
/* REDIS CONFIGURATION */
let redisUrl = process.env.REDIS_URL;
if (redisUrl) {
  redisUrl = redisUrl.trim();
  if (redisUrl.startsWith('redis-cli -u ')) {
    redisUrl = redisUrl.replace('redis-cli -u ', '').trim();
  }
  // Strip quotes if present
  if ((redisUrl.startsWith('"') && redisUrl.endsWith('"')) || (redisUrl.startsWith("'") && redisUrl.endsWith("'"))) {
    redisUrl = redisUrl.slice(1, -1);
  }
}

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT) || 7000;
const redisPassword = process.env.REDIS_PASSWORD || 'ijh21999ijh21999!';

const cluster = redisUrl 
    ? redis.createClient({ url: redisUrl }).on('error', (err) => console.log('Redis Error:', err))
    : redis.createCluster({
        rootNodes: [
            { url: `redis://${redisHost}:${redisPort}` },
            { url: `redis://${redisHost}:${redisPort + 1}` },
            { url: `redis://${redisHost}:${redisPort + 2}` },
        ],
        useReplicas: true,
        defaults: { password: redisPassword }
      }).on('error', (err) => console.log('Redis Cluster Error:', err));

var MongoClient = require('mongodb').MongoClient;
const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ianjhh:ijh21999@imgupload.l8bfttd.mongodb.net/?retryWrites=true&w=majority&appName=imgupload";
const client = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: 5000
});

const database = client.db('imgupload');
const credentials = database.collection('credentials');
const quiz = database.collection('quiz');
const game = database.collection('game');
const animalFact = database.collection('animalFact');
const spaceFact = database.collection('spaceFact');
const historyFact = database.collection('historyFact');

const initBloomFilter = async () => {
    try{
        let emailArr = await credentials.distinct("email");
        await cluster.connect();
        
        // Delete any pre-existing Bloom Filter
        await cluster.del('emailBloom');
            
        // Reserve/Create a Bloom Filter with configurable error rate and capacity
        await cluster.bf.reserve('emailBloom', 0.01, 1000);
        console.log('Reserved Bloom Filter.');
        
        // Add multiple items to Bloom Filter at once with BF.MADD command
        await cluster.bf.mAdd('emailBloom', emailArr);
    }
    catch(e){
        console.log('Bloom filter initialization status:', e.message || e);
    }
}
initBloomFilter();

/* NODEMAILER OAUTH2 & APP PASSWORD CONFIGURATION */
const emailUser = process.env.EMAIL_USER || "kuisanak.id@gmail.com";
let rawPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD || process.env.GMAIL_PASS || process.env.MAIL_PASS;
// Sanitize App Password by stripping spaces and quotes
const emailPass = rawPass ? rawPass.replace(/\s+/g, '').replace(/['"]/g, '').trim() : null;

let transporter;
if (emailPass) {
  // Option 1: Gmail App Password (service: "gmail" handles port 587/465 STARTTLS automatically for Render)
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
} else if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID) {
  // Option 2: Google OAuth2
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: emailUser,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });
} else {
  // Fallback SMTP (port 587)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

// Verify Nodemailer transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer transporter connection failed:", error.message || error);
  } else {
    console.log("✅ Nodemailer transporter connected successfully to Gmail SMTP!");
  }
});

app.get('/api/', async (req, res) => {
    res.send('Quizanak API Server is running');
});

app.post('/api/fetchSimilarQuiz', async (req, res) => {
  try{
      let result = await quiz.find({category: req.body.category, name: {$nin: [req.body.quizName] }}, {projection: {_id: 0, title: 1, quizImage: 1, name: 1}}).toArray();
      res.status(200).json(result);
  }
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.post('/api/validateEmail', async (req, res) => {
  try{
        /* check whether email exists in bloom filter */
        const emailExists = await cluster.bf.exists('emailBloom', req.body.email);
        
        if(emailExists){
            /* cross check with database since it could be false positive */
            let found = await credentials.findOne({email: req.body.email}, {projection: {_id: 0, email: 1}});

            if(found){
                res.status(409).send('Email exists already!');
            }
            else{
                /* update bloom filter to make it up-to-date with db */
                res.status(200).send('Email does not exist! You can use that email!');
            }
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

app.post('/api/resendCode', async (req, res) => {
    try{
        let targetUsername = req.body.username;
        if (!targetUsername && req.cookies && req.cookies.jwt) {
            try {
                const decoded = jwt.verify(req.cookies.jwt, 'privatekey');
                targetUsername = decoded.username;
            } catch (jwtErr) {}
        }

        if (!targetUsername) {
            return res.status(400).send('Username tidak ditemukan!');
        }

        let result = await credentials.findOne({username: targetUsername }, {projection: {_id: 0, email: 1}});

        if(result){
            const verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');
            await credentials.updateOne({username: targetUsername}, {$set: {verificationCode: verificationCode, codeCreatedAt: new Date().getTime()}});
            const foundEmail = result.email;
    
            const mailOptions = {
                from: `"KuisAnak" <${emailUser}>`,
                to: foundEmail,
                subject: "Masukin kode 6-digit yang diberikan untuk verifikasi akun anda.",
                text: `Kode verifikasi anda adalah:\n${verificationCode}`
            };
    
            try {
              let info = await transporter.sendMail(mailOptions);
              console.log("Email sent: ", info.response);
              return res.status(200).send('Berhasil mengirim ulang email verifikasi!');
            } catch (mailError) {
              console.error("Error sending verification email: ", mailError);
              return res.status(500).send('Gagal mengirim email: ' + (mailError.message || mailError));
            }
        }
        else{
            return res.status(404).send('Pengguna tidak ditemukan!');
        }
    }
    catch(e){
        console.log(e);
        return res.status(400).send('Error!');
    }
})

app.post('/api/login', async (req, res) => {
  try{
    let result = await credentials.findOne({username: req.body.username });
    if(!result){
      res.status(404).send('Username atau kata sandi salah!');
    }
    else{
    bcrypt.compare(req.body.password, result.password, function(err, result) {
      if(result!==true){
          res.status(404).send('Username atau kata sandi salah!')
      }
      else{
          jwt.sign({username: req.body.username}, 'privatekey', { expiresIn: '1h' },(err, token) => {
              if(err) { 
                  res.status.send('Error!')
                  console.log(err)
              }
              res.status(200).cookie('jwt', token, { sameSite: 'none', secure: true }).json({verified: result.verified});
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
          let verificationCode = crypto.randomInt(100000).toString().padStart(5, '0');
            
          const mailOptions = {
            from: `"KuisAnak" <${emailUser}>`,
            to: data.email,
            subject: "Masukin kode 6-digit yang diberikan untuk verifikasi akun anda.",
            text: `Kode verifikasi anda adalah:\n${verificationCode}`
          };
    
          try {
            let info = await transporter.sendMail(mailOptions);
            console.log("Email sent: ", info.response);
          } catch (mailError) {
            console.error("Error sending registration email: ", mailError);
          }
      
          await credentials.insertOne({username: data.username, password: data.password, email: data.email, verified: data.verified, createdAt: data.createdAt, verificationCode: verificationCode, codeCreatedAt: new Date().getTime()});
          try {
            await cluster.bf.add('emailBloom', data.email);
          } catch (bloomErr) {
            console.log('Bloom filter add status:', bloomErr.message || bloomErr);
          }

          jwt.sign({username: req.body.username}, 'privatekey', { expiresIn: '1h' },(err, token) => {
                  if(err) { 
                      res.status.send('Error!')
                  }
                  res.status(200).cookie('jwt', token, { sameSite: 'none', secure: true }).send('Successful!');
          });
}
    catch(e){
      res.status(400).send('Error!')
      console.log(e)
    }
})

app.get('/api/homepage', async (req, res) => {
    if(!req.cookies.jwt){
      res.status(400).send('Token otentikasi tidak valid, tolong coba lagi.')
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
                      res.status(400).send('Akun belum diverifikasi!');
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
  try{
    if(!req.cookies.jwt){
      res.status(400).send('error')
    }
    else{
        jwt.verify(req.cookies.jwt, 'privatekey', async (err, authorizedData) => {
          if(err){
              //If error send Forbidden (403)
              console.log(err)
              res.status(403).send('error');
          } 
          else {
              /* retrieve verified status of user */
              let found = await credentials.findOne({username: authorizedData.username}, {verified:1, _id:0});

              if(!found){
                  res.status(400).send('Oops! ada error.')
              }
            
              //If token is successfully verified, we can send the authorized data 
              res.status(200).json({
                  message: 'Successful log in',
                  verified: found.verified,
                  authorizedData
              });
          }
        })
    }
  }
  catch(e){
      res.status(400).send('Oops! ada error.')
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
      let verifySuccess = await credentials.findOne({verificationCode: req.body.verificationCode}, {projection: {_id: 0, verificationCode: 1, codeCreatedAt: 1}});

      if(verifySuccess){
          /* if verification code expired */
          if ((verifySuccess.codeCreatedAt + 86400000) >= new Date().getTime()){
              res.status(498).send('Code Expired!')
          }
          
          let result = await credentials.updateOne({verificationCode: req.body.verificationCode}, {$set: {verified: true}, $unset: {createdAt: "", verificationCode: "", codeCreatedAt: ""}});  
          if(!result){
            res.status(404).send('Not found!');
          }
          else{
                jwt.sign({username: req.body.username}, 'privatekey', { expiresIn: '1h' },(err, token) => {
                  if(err) { 
                      res.status.send('Error!')
                  }
                res.status(200).cookie('jwt', token, { sameSite: 'none', secure: true }).send('Successful!');
            });
          }
      }
      else{
          res.status(404).send('Wrong verification code!');
      }
  }   
  catch(e){
      console.log(e)
      res.status(400).send('Error!')
  }
})

app.get('/api/logout', async (req, res) => {
    try{
        res.status(202).clearCookie('jwt', { sameSite: 'none', secure: true }).send('cookie cleared')
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
