import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Ensure default admin user exists
export async function ensureAdminUser() {
  try {
    const adminEmail = "admin@admin.de";
    const adminPassword =
      "$2a$10$.i78YvWX0u2tt9Iwz52G3e8oQWBuABWkun7m90IyY5rZgFGdYncfm"; // bcrypt hash

    const [, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: { password: adminPassword },
    });

    if (created) {
      console.log("Admin user created");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
  }
}

export default User;
