const express = require('express');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Offer = require('../models/offerModel');

const loadCategory = async (req,res)=>{
    try{
        const category = await Category.find().populate('Offer');
        console.log(category);
        res.render('category',{ category })
    }catch(error){
        console.log(error);
    }
}

const addCategory = async (req,res)=>{

    try{
        const cname =req.body.category;
        let cat = await Category.findOne({name:cname});
        if(!cat){
            await Category.create({name:cname});
        }
        
        res.redirect('/admin/category');

    }catch(error){
        console.log(error);
    }
}

const deleteCategory = async(req,res)=>{
    try{
        const id = req.params.id;
        const cat = await Category.findById(id);
        await Category.deleteOne({_id:id});
        await Product.deleteMany({Category:cat.name});
        res.redirect('/admin/category');
    }catch(error){
        console.log(error);
    }
}

const updateCategory = async (req,res)=>{
    try{
        let id = req.params.id;
        const cname = req.body.data;
        console.log(cname)
        const catg = await Category.findOne({_id:{$ne:id},name:cname});
        if(!catg){
            await Category.updateOne({_id:id},{$set:{name:cname}});
            res.json({success:true});
        }else{
            res.json({exist:true});
        }     
        
    }catch(error){
        console.log(error);
    }
}

module.exports = { 
    addCategory,
    loadCategory,
    deleteCategory,
    updateCategory
};