const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

async function checkData() {
    await mongoose.connect("mongodb://127.0.0.1:27017/UniRooms");
    const listings = await Listing.find({}).limit(5);
    console.log("Found", listings.length, "listings.");
    listings.forEach(l => {
        console.log(`- ${l.title}: Geometry: ${JSON.stringify(l.geometry)}`);
    });
    await mongoose.connection.close();
}

checkData();
