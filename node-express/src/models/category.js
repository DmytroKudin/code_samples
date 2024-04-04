const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Category = sequelize.main.define('Category', {
    id_category: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id_category'
      }
    },
    description: DataTypes.TEXT,
    level: DataTypes.INTEGER
  }, {
    tableName: 'categories',
    timestamps: false
  });
  
  module.exports = Category;