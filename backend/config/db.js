const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://pawarparth915_db_user:DzE1SE4RQx9zSp0K@whispering.wjhzmxr.mongodb.net/whispering?retryWrites=true&w=majority&appName=whispering');
    console.log(`\x1b[36m%s\x1b[0m`, `[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `[Database Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
