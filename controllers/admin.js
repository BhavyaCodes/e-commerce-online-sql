const Product = require('../models/product')

exports.getAddProduct = (req,res,next)=>{
    res.render('admin/edit-product',{
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    })
}

exports.postAddProduct = (req, res, next)=>{
    req.user.createProduct({    //creates connected model
        title: req.body.title,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        description: req.body.description
    })
    .then(result=>{
        res.redirect('/admin/products')
    }).catch(e=>{
        console.log(e)
    })
}

exports.getEditProduct = (req,res,next)=>{
    const editMode = req.query.edit
    if(editMode !== 'true'){
        return res.redirect('/')
    }
    const prodId = req.params.productId
    req.user.getProducts({where: {id: prodId} })
        .then(products=>{
            const product = products[0]
            if(!product) {
                return res.redirect('/')
            }
            res.render('admin/edit-product',{
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product
            })
        })
}

exports.postEditProduct = (req,res)=>{
    const prodId = req.body.productId
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price
    const updatedImageUrl = req.body.imageUrl
    const updatedDesc = req.body.description

    req.user.getProducts({where: {id: prodId} })
        .then(products=>{
            const product = products[0]
            product.title = updatedTitle,
            product.price = updatedPrice,
            product.imageUrl = updatedImageUrl,
            product.description = updatedDesc
            return product.save()  //saves product to db, creates if it doesn't exist otherwise update 
        })
        .then(result=>{
            console.log('UPDATED PRODUCT')
            res.redirect('/admin/products')
        })
        .catch(e=>console.log(e))
}

exports.getProducts = (req,res)=>{
    req.user
        .getProducts()
        .then(products=>{
            res.render('admin/products',{
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            })
        })
        .catch(e=>console.log(e))
}

exports.postDeleteProduct = (req, res) =>{
    const prodId = req.body.productId
    //Product.destroy({})
    Product.findByPk(prodId)
        .then(product=>{
            return product.destroy()
        })
        .then(result=>{
            console.log('destroyed product')
            res.redirect('/admin/products')
        })
        .catch(e=>console.log(e))
}