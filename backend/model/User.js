// models/User.js
import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  class User extends Model {
    
    async validatePassword(password) {
      return bcrypt.compare(password, this.passwordHash);
    }
  }

  User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" }
  }, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    paranoid: false
  });


  return User;
};
