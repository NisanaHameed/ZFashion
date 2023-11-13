const express = require('express');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const loadCart = async (req, res) => {
    try {
        let username = req.session.username;
        const userid = req.session.userId;
        console.log('user ' + userid)
        let total = 0;
        const cart = await Cart.findOne({ UserId: userid }).populate('Products.ProductId').populate('isCoupon');
        console.log(cart);
        if(cart){
            var products = cart.Products;
            console.log(cart)
            console.log('total '+total);
            products.forEach(item => {
                total+=item.Totalprice;
            });
            if(cart.isCoupon){
                let date = new Date();
                if(cart.isCoupon.criteriaAmount>cart.totalAmount || cart.isCoupon.usersLimit<=cart.isCoupon.usedUsers.length || cart.isCoupon.isBlock==true || cart.isCoupon.activationDate>date || cart.isCoupon.expiryDate<date ){
                    await Cart.updateOne({UserId:userid},{$set:{totalAmount:total},$unset:{isCoupon:1}});
                    
                }
            }
        }          
            res.render('cart', { cart,total,username});
       
        // console.log(products);
    } catch (error) {
        console.log(error);
        
    }
}

const addCart = async (req, res) => {
    try {
        
        const userId = req.session.userId;
        if (!userId) {
            return res.json({ message: 'Please log in!!' });
        }
        let user = await User.findById(userId);
        if(user.isBlock==true){
            return res.json({blocked:true});
        }
        console.log(userId);
        const productId = req.body.productId;
        console.log(productId);
        const product = await Product.findOne({ _id: productId });
        if (product.Stock > 0) {
                // let total = 0;
            const cart = await Cart.findOne({ $and: [{ UserId: userId, 'Products.ProductId': productId }] })
            
            if (cart) {

                return res.json({incart:true});
                
            } else {
                // let cartproducts = await Cart.findOne({UserId:userId});
                // if(cart!=null && cartproducts.Products.length>0){
                //     cartproducts.Products.forEach(item=>{
                //         total+=item.Totalprice;
                //     })
                // }               
                const pr = {
                    ProductId: productId,
                    Price: product.Price,
                    Totalprice: product.Price,
                    Quantity: 1,
                    Size:req.body.size
                }
                console.log(product.Price)
                await Cart.updateOne({ UserId: userId }, {$inc:{totalAmount:product.Price }, $push: { Products: pr } }, { upsert: true });

            }
            return res.json({ stock: true });
        } else {
            return res.json({ stock: false });
        }
    } catch (error) {
        console.log(error);
    }
}

const removeCartItem = async (req,res)=>{
    try{
        let userId = req.session.userId;
        let productId = req.body.productId;
        let cart = await Cart.findOne({UserId:userId}).populate('isCoupon');
        await Cart.updateOne({UserId:userId},{$pull:{'Products':{ProductId:productId}}});
        console.log('Your cart ='+cart)
        const removedProduct = cart.Products.filter(item=>{
            if(item.ProductId==productId){
                return item
            }
        })
        let total = 0;
        console.log(cart);
        cart.Products.forEach(item=>{
            total+=item.Totalprice
        });
        if(cart.isCoupon){
            if(total-removedProduct[0].Totalprice<cart.isCoupon.criteriaAmount){
                await Cart.updateOne({UserId:userId},{$set:{totalAmount:total},$unset:{isCoupon:1}})
            }
        }
        await Cart.updateOne({UserId:userId},{$inc:{totalAmount:-removedProduct[0].Totalprice}});
        res.json({success:true});
    }catch(error){
        console.log(error);
    }
}
const updateQuantity = async (req,res)=>{
    try{
        
        let userId = req.session.userId;
        console.log(userId)
        const { productId,count } = req.body;
        console.log('datatype'+typeof(productId))
        const products = await Product.findOne({_id:productId});
        const cart = await Cart.findOne({UserId:userId}).populate('isCoupon');
        let product = cart.Products.filter(val=>{
            if(val.ProductId==productId)
            return val;
        })
        console.log(product);
        if(product[0].Quantity+count>=1 && product[0].Quantity+count<=products.Stock){
        let newTotalprice = count*(products.Price);
        
        await Cart.updateOne({UserId:userId,'Products.ProductId':productId},{$inc:{'Products.$.Quantity':count,'Products.$.Totalprice':newTotalprice,totalAmount:newTotalprice}});
        
        if(cart.isCoupon){
           const updatedCart = await Cart.findOne({UserId:userId});
           const totalprice = updatedCart.Products.reduce((a,item)=>{
            return a+item.Totalprice;
        },0);
        console.log('Totalprice='+totalprice);
        if(totalprice<cart.isCoupon.criteriaAmount){
            await Cart.updateOne({UserId:userId},{$set:{totalAmount:totalprice},$unset:{isCoupon:1}});
        }
        }
        res.json({success:true});
    }else{
        if(product[0].Quantity+count<=1){
            res.json({mincount:true});
        }else{
            res.json({nostock:true});
        }
    }
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    loadCart,
    addCart,
    removeCartItem,
    updateQuantity
}