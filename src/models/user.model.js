import mongoose , {Schema} from 'mongoose';
import {jwt} from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { use } from 'react';

const userSchema = new Schema({
   username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,

   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6
   },
   fullName:{
      type: String,
      required: true,
      trim: true,

   },
   avatar: {
      type: String,   //cloudinary URL or local path
      default: 'https://res.cloudinary.com/durgesh2411/image/upload/v1681234567/default-avatar.png',
      required: true // default avatar URL
   },
   watchHistory: [{
      type: Schema.Types.ObjectId,
      ref: 'Video' // Assuming you have a Video model
   }],
   refreshToken: {
      type: String,
   },
   createdAt: {
      type: Date,
      default: Date.now
   }
   }, {
   timestamps: true
});

userSchema.pre('save', async function(next){        // Middleware(mongoose-hook --> '.pre') to hash password before saving
   if(!this.isModified('password')) return next();  // Check if password is modified(not other fields is modified not password)
      // Hash the password before saving
   this.password = await bcrypt.hash(this.password, 10);
   next();
})

userSchema.methods.isPasswordValid = async function(password) {
   return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function() {
   return jwt.sign({    // jwt.sign() is used to create a token
      _id : this._id,   // this is the payload (fetching user id from the user object)
      email: this.email, // optional, can be used for additional verification form mongodb , other information can be fetched using indexing later.
      username : this.username,
      fullname : this.fullName
   },
   process.env.ACCESS_TOKEN_SECRET,
   {expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' // default expiry is 1 day( given in object form)
});
}
userSchema.methods.generateRefreshToken = function() {
   return jwt.sign({
      _id: this._id,
   },
   process.env.REFRESH_TOKEN_SECRET,
   {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' // default expiry is 7 days
   }
   );
}

export const User = mongoose.model('User', userSchema);
