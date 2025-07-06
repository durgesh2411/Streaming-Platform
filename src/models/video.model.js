import mongoose ,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new Schema({
   title: {
      type: String,
      required: true,
      trim: true,
   },
   description: {
      type: String,
      required: true,
      trim: true,
   },
   videoUrl: {
      type: String,
      required: true, // URL to the video file
   },
   duration:{
      type: Number,
      required: true, // Duration of the video in seconds by cloudinary
   },
   thumbnailUrl: {
      type: String,
      required: true, // URL to the thumbnail image
   },
   uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
   },
   views: {
      type: Number,
      default: 0, // Default view count is zero
   },
   likes: {
      type: Number,
      default: 0, // Default like count is zero
   },
   isPublished:{
      type: Boolean,
      default: false, // Default is not published
   },
   dislikes: {
      type: Number,
      default: 0, // Default dislike count is zero
   },
   createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation date
   }
},{
   timestamps: true // Automatically manage createdAt and updatedAt fields
});
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);
