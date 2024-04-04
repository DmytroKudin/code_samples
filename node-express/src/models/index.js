const Profile = require('./profile');
const ObjectUnit = require('./objects');
const Category = require('./category');
const Product = require('./products');

Category.hasMany(Category, { as: 'SubCategories', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'ParentCategory', foreignKey: 'parentId' });

module.exports = {
  Profile,
  Request,
  ObjectUnit,
  Category,
  Product
};
