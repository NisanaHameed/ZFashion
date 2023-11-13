var express = require('express');
const user = require('../models/userModel');
const bcrypt = require('bcrypt');
const multer = require('multer');


const loadLogin = (req,res)=>{
    try{
        res.render('login',{error:''});
    }catch(err){
        console.log(err)
    }   
};

const registerLogin = async (req,res)=>{
    
    try{
        const data = await user.findOne({email:req.body.email,role:"admin"})
        if(data){
            const isPasswordValid =await bcrypt.compare(req.body.password,data.password)
            if(isPasswordValid ){               
                req.session.loggedIn = true;
                req.session.admin = data;
                let name=data.name
                console.log(name);
                res.redirect('/admin');   
            }else{
                res.render('login',{error:"Password does not match!"})
            }
        }else{
            res.render('login',{error:"Email does not match!"})
        }
    }catch(err){
        console.log(err);
        res.status(500)
    }
}

const loadDashboard = (req,res)=>{
    try{
        const data=req.session.admin;
        res.render('dashboard',{name:data.name});
    }catch(err){
        console.log(err);
    }
}

const loadUsers = async (req,res)=>{
    
    let name = req.session.admin.name
    user.find({role:'user'})
    .then(users=>{

        res.render('users',{users,name})
    })
    .catch((err)=>{

        console.log(err)
        res.status(500).send({error:'Something went wrong'})
    })
}

const blockUser = async (req,res)=>{

    const { id} = req.params;
    try{
        const data = await user.findById(id);
        
        if(!data){
            res.send('User not found');

        }
        const isBlocked = data.isBlock;
        
        await user.updateOne({ _id:id },{ $set:{ isBlock:!isBlocked }});
         
        res.redirect('/admin/Users');
    }catch(err){
        res.send(err);
    }
}


const adminLogout = async (req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/admin/login');
    }catch(error){
        console.log(error);
    }
}

module.exports = {
    loadDashboard,
    loadLogin,
    registerLogin,
    loadUsers,
    blockUser,
    adminLogout,
}