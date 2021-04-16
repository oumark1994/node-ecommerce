const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/product');
const categoryRoutes = require('./routes/category');
const ordersRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');
// const expressJwt= require('express-jwt');
// const {isRevoked} = require('./helpers/isRevoked');
 const errorHandler = require('./errors/errorHandler');
require('dotenv/config');
const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());


// app.use(authJwt);
const api = process.env.API_URL;


// app.use(expressJwt({ secret:process.env.secret , algorithms: ['HS256'],isRevoked:isRevoked}).unless({path:[
//  {url: /\/public\/uploads(.*)/ , methods: ['GET', 'OPTIONS'] },
// ]}))

//Handler all errors on the server
app.use(errorHandler)

app.options('*',cors());

mongoose.connect(process.env.DATABASE,{useCreateIndex:true,useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
    console.log('Database connection is ready...')
}).catch((err)=>{console.log(err);})
app.use(`${api}`,productRoutes);
app.use(`${api}`,categoryRoutes);
app.use(`${api}`,userRoutes);
app.use(`${api}`,ordersRoutes);
app.use('/public/uploads',express.static(__dirname + '/public/uploads'))


app.listen(5000,()=>{
    console.log('server is running on port 5000');
})