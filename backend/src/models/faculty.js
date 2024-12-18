import { DataTypes } from "sequelize";
import sequelize from "./index.js";
import H5PContent from "./H5PContent.js";

const Faculty = sequelize.define("Faculty", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Beziehung zwischen Faculty und H5PContent definieren
Faculty.hasMany(H5PContent, { foreignKey: "facultyId", onDelete: "CASCADE" });
H5PContent.belongsTo(Faculty, { foreignKey: "facultyId" });

export default Faculty;
