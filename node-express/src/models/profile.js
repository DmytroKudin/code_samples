const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Profile = sequelize.main.define('Profile', {
  id_profile: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profilename: DataTypes.STRING,
  profilelogourl: DataTypes.STRING,
  email: DataTypes.STRING,
  first_name: DataTypes.STRING,
  showname: DataTypes.STRING,
  map: DataTypes.STRING,
  dynamic_map: DataTypes.BOOLEAN,
  questions_limit: DataTypes.INTEGER,
  notification_threshold: DataTypes.INTEGER
}, {
  tableName: 'profiles',
  timestamps: false,
});

module.exports = Profile;
