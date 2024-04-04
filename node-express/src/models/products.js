const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Profile = require('./profile');

const Product = sequelize.main.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  profile_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Profile,
      key: 'id_profile'
    }
  },
  name: DataTypes.STRING
}, {
  tableName: 'products',
  timestamps: false,
});

module.exports = Product;
