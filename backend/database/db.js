
import Sequelize from "sequelize";
import env from "dotenv";
env.config();
const DB_URL = process.env.DB_URL;
const sequelize = new Sequelize(DB_URL);

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established");
    } catch (err) {
        console.log("Unable to connect", err);
    }
})();

export default sequelize;