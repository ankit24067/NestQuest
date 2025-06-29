require('dotenv').config();
console.log("ATLASDB_URL:", process.env.ATLASDB_URL);

const mongoose = require("mongoose");
const initData = require("./data");
const Listing = require("../models/listing");

// const mongo_URL = "mongodb://127.0.0.1:27017/nestquest";
const dbURL = process.env.ATLASDB_URL;
async function main(){
   await mongoose.connect(dbURL)
}

main().then(()=>{
   console.log("connected to db");
}).catch((err)=>{
   console.log(err);

})

const initDb = async()=>{
   await Listing.deleteMany({});
   initData.data = initData.data.map((obj)=>({...obj, owner:"685d658f34111b8b8973ea62"}));
   await Listing.insertMany(initData.data);
   console.log("data was initialized")


}
initDb();