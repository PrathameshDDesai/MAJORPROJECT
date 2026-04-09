const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/UniRooms";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});

    // Add default geometry, city, and other required fields to all listings
    const updatedData = initData.data.map((obj) => ({
        ...obj,
        owner: "679e09d66144865ae93f7736",
    }));

    await Listing.insertMany(updatedData);
    console.log("Data was initialized with default coordinates");
}

initDB();