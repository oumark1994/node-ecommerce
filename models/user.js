const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv/config');


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    passwordHash:{
        type:String,
        required:true,
    },
    phone:{
        type:String,     
        required:true,
    },
    isAdmin:{
        type:Boolean,
    },
    street:{
        type:String,
        default:''
    },
    appartment:{
        type:String,
        default:''
    },
    zip:{
        type:String,
        default:''
    },
    city:{
        type:String,
        default:''
    },
    country:{
        type:String,
        default:''
    }

});
userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

userSchema.set('toJSON',{
    virtuals:true,
});
const secret = process.env.secret
userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign({_id:this._id,isAdmin:this.isAdmin},secret,{expiresIn:'1d'})
    return token;
}

module.exports = mongoose.model('User',userSchema);