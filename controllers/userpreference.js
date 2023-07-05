const jwt = require('jsonwebtoken')
const env = require('dotenv').config();
const router = require('express').Router();
const bcrypt = require('bcrypt')
const {User} = require('./../model/User')
const jwtDecode = require('jwt-decode')
const fetch = require("node-fetch");
const verifyToken = async (req, res, next) => {
     const { authorization } = req.headers;
     const token = authorization.split(' ')[1];
     try {
          const jt = await jwt.verify(token, process.env.TOKEN_SECRET)
          next();
     } catch (error) {
          res.status(401).send("Unauthorized");
     }

}
router.post('/register',async (req,res) => {
        console.log(env)
        var user = new User({
                name: req.body.name,
                preferences: [],
                password: bcrypt.hashSync(req.body.password,parseInt(process.env.SALT))
        });
        var saveUser = await user.save()
        if(!saveUser){
                res.status(500).json({
                        message: "Internal Error during Database Save operation",
                        error: err
                })
                return
        }
        res.status(200).json({
                message: "Success"
        });
})
router.post('/login',(async (req,res)=>{
        var user = await User.findOne({name: req.body.name})
        if(!user){
                res.status(400).json({
                        message: 'User not found in database'
                });
        }
        console.log(user)
        console.log(req.body)
        const validPassword = bcrypt.compareSync(req.body.password, user.password);

        if (!validPassword) {
                res.status(401).json({ message: "Invalid credencial" })
                return
        }
        const jt = await jwt.sign({user,expire: Date.now() + (1000 * 60 * 60)},process.env.TOKEN_SECRET);
        res.status(200).json({
                message: 'Login Successful',
                token: jt,
                id: user._id
        });
        return
}));

router.get('/news',verifyToken,async (req,res)=>{
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];
        const user = jwtDecode(token).user;
        let appString = ''
        console.log(user)
        const userDB = await User.findOne({_id: user._id})
        console.log(userDB);
        if(userDB.preferences.length>0){
                appString = `q=${userDB.preferences.join(',')}&`
        }
        console.log(appString)
        console.log(`https://newsapi.org/v2/everything?${appString}apiKey=${process.env.API_KEY}`)
        const response = await fetch(`https://newsapi.org/v2/everything?${appString}apiKey=${process.env.API_KEY}`);
        const news = await response.json();
        if(news.status=='error'){
                res.status(500).json({
                        error: 'error calling news api',
                        message: news.message,
                        code: news.code
                });
                return;
        }
        res.status(200).json({
                articles: news.articles
        })
})

router.get('/news/preferences',verifyToken,async (req,res)=>{
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];
        const user = jwtDecode(token).user;
        const userDB = await User.findOne({_id: user._id})
        res.status(200).json({
                preferences: userDB.preferences
        })
        return;
})

router.put('/news/preferences',verifyToken,async (req,res)=>{
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];
        const user = jwtDecode(token).user;
        const userDB = await User.findOne({_id:user._id})
        userDB.preferences = req.body.preferences;
        const usr = await userDB.save()
        if(!usr){
                res.status(500).json({
                        error: 'user not saved in database'
                })

                return
        }
        res.status(200).json({
                preferences: usr.preferences
        })
})

module.exports = {router}