const sequelize = require('./sequelize');
const { Profile, Request, Question, Doc, Evidence, Access, Metrics, Category, Content, Dialog, ObjectUnit, Prompt, Settings, Tree, Vocab } = require('../models');

Promise.all([
  sequelize.main.sync({ alter: true }),
  sequelize.log.sync({ alter: true }),
  sequelize.notification.sync({ alter: true }),

])
  .then(() => {
    console.log("All models were synchronized successfully.");
  })
  .catch(error => {
    console.error("An error occurred while synchronizing models:", error);
  });
