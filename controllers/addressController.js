const express = require('express');
const Address = require('../models/addressModel');

const getAddress = async (req,res)=>{
    try{
        let username = req.session.username;
        let userid = req.session.userId;
        const address = await Address.findOne({UserId:userid})
        console.log(address);
        res.render('address',{address,username});
    }catch(error){
        console.log(error);
    }
}

const getaddAddress = async (req,res)=>{
    try{
        let username = req.session.username;
        res.render('addAddress',{username});
    }catch(error){
        console.log(error);
    }

}

const add_newaddress = async (req,res)=>{
    try{
        
        let userid = req.session.userId;
        const data ={
            Name:req.body.name,
            State:req.body.state,
            HouseName:req.body.housename,
            City:req.body.city,
            Locality:req.body.locality,
            Mobile:req.body.mobile,
            Pincode:req.body.pincode
        }
        await Address.updateOne({UserId:userid},{$addToSet:{Address:data}},{upsert:true});
        res.json({success:true});
    }catch(error){
        console.log(error);
    }
}

const loadOrderAddress = (req,res)=>{
    try{
        let username = req.session.username;
        res.render('orderAddress',{username});
    }catch(error){
        console.log(error);
    }
}

const addOrderAddress = async (req,res)=>{
    try{
        let userid = req.session.userId;
        const data = {
            Name:req.body.name,
            State:req.body.state,
            HouseName:req.body.housename,
            City:req.body.city,
            Locality:req.body.locality,
            Mobile:req.body.mobile,
            Pincode:req.body.pincode
        }
        await Address.updateOne({UserId:userid},{$addToSet:{ Address:data }},{upsert:true})
        .then(()=>{
            console.log('address added');
            res.json({success:true});
        }).catch((err)=>{
            console.log(err);
        })
    }catch(error){
        console.log(error);
    }
}

const deleteAddress = async (req,res)=>{
    try{
        let userid = req.session.userId;
        let addressId = req.body.addressid;
        await Address.updateOne({UserId:userid},{$pull:{Address:{_id:addressId}}})
        .then(()=>{
            res.json({deleted:true});
        })
        .catch((err)=>{
            console.log(err);
            res.json({deleted:false});
        });

    }catch(err){
        res.status(500).send(err);
        console.log(err);
    }
}

const editAddress = async (req,res)=>{
    try{
        console.log('heloo')
        let user = req.session.userId;
        console.log(user)
        let addressid = req.params.id;
        console.log('addressid '+addressid)
        let data = {
            Name:req.body.name,
            HouseName:req.body.housename,
            Locality:req.body.locality,
            City:req.body.city,
            State:req.body.state,
            Pincode:req.body.pincode,
            Mobile:req.body.mobile
        }
        console.log(data);
        await Address.updateOne({UserId:user,'Address._id':addressid},{$set:{'Address.$':data}})
        .then(()=>{
            res.json({success:true});
            console.log('address updated');
        }).catch((arr)=>{
            console.log(err);
        })
    }catch(err){
        res.status(500).send(err);
    }
}

module.exports = {
    getAddress,
    getaddAddress,
    add_newaddress,
    loadOrderAddress,
    addOrderAddress,
    deleteAddress,
    editAddress
}