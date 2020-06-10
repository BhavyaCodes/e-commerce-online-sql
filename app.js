const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const errorController = require('./controllers/error')

const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

const port = process.env.PORT || 3000

const app = express()



app.set('view engine','ejs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname,"public")))
app.use(bodyParser.urlencoded({extended:true})) //false in tutorial

app.use((req,res,next)=>{
    User.findByPk(1)
        .then(user=>{
            req.user = user     //req.user is not just javascript object, it is a sequelize object
            next()              //we can execute methods on it like destroy()
        })                          
        .catch(e=>console.log(e))
})

app.use('/admin',adminRoutes)
app.use(shopRoutes)

app.use(errorController.get404)

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'}) //User created product //deletion will also be executed for the product
User.hasMany(Product)   //optional
User.hasOne(Cart)
//Cart.belongsTo(User) //optional
Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})    //many to many
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })

sequelize
    .sync()
    .then(async(result)=>{
        let user = await User.findByPk(1)
        if(!user){
            user = await User.create({name: 'Max', email: 'test@test,com'})
        }
        let cart = await user.getCart()
        if(!cart){
            cart = await user.createCart()
        }
        await app.listen(port)
    })
    .catch(e=>console.log(e))

// sequelize
//     .sync({force:true})
//     .then(result =>{
//         return User.findByPk(1)
//     })
//     .then(user=>{
//         if (!user){
//             return User.create({name: 'Max', email: 'test@test.com'})
//         }
//         return user
//     })
//     .then(user=>{
//         return user.getCart()
//     })
//     .then(cart=>{
//         if (!cart){
//             return user.createCart()
//         }
//     })
//     .then(cart=>{
//         app.listen(port)
//     })
//     .catch(e=> console.log(e))
