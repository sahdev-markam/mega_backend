import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import {Video} from '../models/video.model.js'
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    console.log(`\n mongodb connected !! DB HOST ${connectionInstance.connection.host}`);
    await Video()
  } catch (error) {
    console.log('mongodb connection ERROR db/index.js', error);
    process.exit(1)
  }
}

export default connectDB