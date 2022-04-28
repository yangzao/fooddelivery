const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const consumerRoutes = require('./Routes/consumers');
const restaurantRoutes = require('./Routes/restaurants');
const itemRoutes = require('./Routes/items')
const cartRoutes = require('./Routes/cart')
const orderRoutes = require('./Routes/orders')
const adminRoutes = require('./Routes/admin')
const cookieParser=require('cookie-parser');

const express = require('express');
const app = express();
const config = require('config');






if(!config.get('PrivateKey')){
    console.error('FATAL ERROR: PrivateKey is not defined');
    process.exit(1);
}

/*mongoose.connect('mongodb://localhost:27017/fooddelivery')
    .then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));*/

mongoose.connect('mongodb+srv://food:food@cluster0.eiabn.mongodb.net/fooddelivery?retryWrites=true&w=majority')
    .then(() => console.log('Now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));


app.use(cookieParser());

app.use(express.json());
app.use('/api/consumers', consumerRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));