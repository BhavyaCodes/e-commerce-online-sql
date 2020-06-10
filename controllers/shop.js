const Product = require('../models/product')

exports.getProducts = (req,res,next)=>{
    Product
        .findAll()
        .then(products=>{
            res.render('shop/product-list',{
                prods: products,
                pageTitle: 'All products',
                path: '/products'
            })
        })
        .catch(e=>console.log(e))
}

exports.getProduct = (req,res)=>{
    const prodId = req.params.productId
    Product.findByPk(prodId).then(product=>{
        res.render('shop/product-detail',{
            product: product,
            pageTitle: product.title,
            path: '/products'
        })
    }).catch(e=>console.log(e))

    //alternative way

    // Product.findAll({where: {id: prodId}})
    //     .then(products=>{
    //         res.render('shop/product-detail',{
    //             product: products[0],
    //             pageTitle: products[0].title,
    //             path: '/products'
    //         })
    //     })
    //     .catch(e=>console.log(e))

}

exports.getIndex = (req,res)=>{
    Product.findAll().then(products=>{
        res.render('shop/index',{
            prods: products,
            pageTitle: 'Shop',
            path: '/'
        })
    }).catch(e=>console.log(e))
}

exports.getCart = (req,res)=>{
    //console.log(req.user.cart) //does not work this way, output- undefined
    req.user
    .getCart()
    .then(cart=>{
        return cart
            .getProducts()
            .then(products => {
                res.render('shop/cart',{
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products
                })
            })
            .catch(e=>console.log(e))
    })
    .then()
    .catch(e=>console.log(e))
}

exports.postCart = (req,res)=>{
    const prodId = req.body.productId
    let fetchedCart
    let newQuantity = 1
    req.user
        .getCart()
        .then(cart=>{
            fetchedCart = cart
            return cart.getProducts({where: {id: prodId}})
        })
        .then(products=>{
            let product
            if (products.length > 0){
                product = products[0]
            }
            if (product){
                const oldQuantity = product.cartItem.quantity
                newQuantity = oldQuantity + 1
                return product
            }
            return Product.findByPk(prodId)
        })
        .then(product=>{
            return fetchedCart.addProduct(product,{
                through: {quantity: newQuantity}
            })
        })
        .then(()=>{
            res.redirect('/cart')
        })
        .catch(e=>console.log(e))
}

exports.postCartDeleteProduct = (req,res)=>{
    const prodId = req.body.productId
    req.user
        .getCart()
        .then(cart=>{
            return cart.getProducts({where: {id: prodId}})
        })
        .then(products =>{
            const product = products[0]
            return product.cartItem.destroy()
        })
        .then(result=>{
            res.redirect('/cart')
        })
        .catch(e=>console.log(e))
}

exports.getCheckout = (req,res)=>{
    res.render('shop/checkout',{
        path: '/checkout',
        pageTitle: 'Checkout'
    })
}

exports.postOrder = (req,res)=>{
    let fetchedCart
    req.user
        .getCart()
        .then(cart=>{
            fetchedCart = cart
            return cart.getProducts()
        })
        .then(products =>{
            return req.user
                .createOrder()
                .then(order=>{
                    return order.addProducts(products.map(product=>{
                        product.orderItem = {quantity: product.cartItem.quantity}
                        return product
                    }))
                })
                .catch(e=>console.log(e))
        })
        .then(result=>{
            fetchedCart.setProducts(null)
        })
        .then(result=>{
            res.redirect('/orders')
        })
        .catch(e=>console.log(e))
}

exports.getOrders = (req,res)=>{
    req.user.getOrders({include: ['products']})
        .then(orders=>{
            res.render('shop/orders',{
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            })
        })
        .catch(e=>console.log(e))
}