import mongoose from "mongoose";

class Database{
    constructor(){
        this.mongoDbURL = process.env.MONGO_DB_URL || "mongodb://localhost:27017/mongo-container";
    }

    private mongoDbURL: string;
    public async connect(){
        try {
            await mongoose.connect(this.mongoDbURL);
            
            console.log("Connected to MongoDB successfully");
            
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw error;
        }
    }
}

const db = new Database();

export default db;