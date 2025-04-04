/* eslint-disable import/no-extraneous-dependencies */
const path=require('path');

const express=require("express");
const cors=require('cors');
const compression=require('compression');


const dotenv=require("dotenv");
const morgan=require("morgan");

const rateLimit=require('express-rate-limit');
const hpp=require('hpp')
const mongoSanitize=require('express-mongo-sanitize');
const xss= require('xss-clean');

dotenv.config({path:"config.env"});

const dbConnection=require('./config/database');
const ApiError=require("./utils/ApiError");
const globalError=require('./middlewares/errorMiddleware');

const mountRoutes=require('./routes/index')

const {webhookCheckout}=require('./services/orderService');

//exress app
const app=express();
//cors -> other domains can access our app
app.use(cors());
app.options('*',cors());

//compression -> compress all responses
app.use(compression());

app.post ('/webhook-checkout',express.row({type:'application/json'}),webhookCheckout)

// connect to DB
dbConnection();
// middelware

// limit repeated requests to public APIs and/or endpoints
app.use(express.json({limit:'20kb'}));
app.use(express.static(path.join(__dirname, 'uploads')));

//To apply data sanitization
app,use(mongoSanitize());
app.use(xss());

//middleware to protect against HTTP Parameter Pollution attacks
app.use(hpp({whitelist:[
    'price',
    'sold',
    'quantity',
    'ratingsAverage',
    'ratingsQuantity',
    'quantity'
    ]
}));

if ( process.env.NODE_ENV==='development'){
    app.use(morgan('dev'));
    console.log(`mode : ${process.env.NODE_ENV}`);
}

//limit requests 
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, 
    message:'Too many requests,please try again after an hour'
});

// Apply the rate limiting middleware to all requests.
app.use("/api",limiter);

//Mount route

mountRoutes(app);

app.all('*',(req,res,next)=>{
// create error and send it to error handling middleware
    next(new ApiError(`cannot find this route : ${req.originalUrl}`,400))
});
// global error handling middleware
app.use(globalError);

const PORT=process.env.PORT|| 8000;

const server= app.listen(PORT,()=>{
    console.log(`App Running on port ${PORT}`);
});

// Handle Rejections outside express
process.on("unhandledRejection",(err)=>{
    console.log(`UnhandledRejection Errors: ${err}`);
    server.close(()=>{
        console.error('Shutting Down...');
        process.exit(1);
    })
    
})