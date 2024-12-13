import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const H5PContent = sequelize.define("H5PContent", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
  },
  previewImage: {
    type: DataTypes.STRING,
  },
  h5pJsonPath: {
    type: DataTypes.STRING,
  },
  info: {
    type: DataTypes.TEXT("long"), // "long" entspricht LONGTEXT
  },
  facultyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Faculties",
      key: "id",
    },
  },
});

export default H5PContent;
