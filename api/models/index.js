import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,      // z. B. "h5p"
  process.env.DB_USER,      // z. B. "root"
  process.env.DB_PASSWORD,  // z. B. "H212T5sd-P!234"
  {
    host: process.env.DB_HOST,  // "localhost", da Express direkt auf dem System läuft
    port: process.env.DB_PORT,  // 3308, da MySQL-Container-Port 3306 auf Hostport 3308 gemappt wird
    dialect: "mysql",
  }
);

export default sequelize;
