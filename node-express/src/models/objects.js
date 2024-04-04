const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Profile = require('./profile');

const ObjectUnit = sequelize.main.define('ObjectUnit', {
  id_object: {
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
  level: DataTypes.STRING,
  name: DataTypes.STRING,
  countryISOa3: DataTypes.STRING,
  products: DataTypes.STRING,
  description: DataTypes.STRING,
  datapoints: DataTypes.INTEGER,
  documents: DataTypes.INTEGER,
  metrics: DataTypes.INTEGER,
  climate_coverage: DataTypes.STRING,
  environment_coverage: DataTypes.STRING,
  social_coverage: DataTypes.STRING,
  governance_coverage: DataTypes.STRING,
}, {
  tableName: 'object',
  timestamps: false,
});

module.exports = ObjectUnit;
