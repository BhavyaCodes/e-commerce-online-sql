require('dotenv').config()
const Sequelize = require('sequelize').Sequelize

const sequelize = new Sequelize('heroku_023afbe5672940b',process.env.DB_USERNAME,process.env.DB_PASSWORD,{
    dialect: 'mysql',
    host:process.env.DB_URL
})

module.exports = sequelize