const app = require('express')();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors')
const {router} = require('./controllers/userpreference')
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(router)
mongoose.connect('mongodb://127.0.0.1:27017/test')
  .then(() => console.log('Connected!'))
  .catch((err)=> console.log('ERROR!! Application cant connect to mongoose'));

app.listen(3000,(err)=>{
    if(err){
        console.log('Server Connection error');
    }
    else{
        console.log('Server Connection Successful!!');
    }
})