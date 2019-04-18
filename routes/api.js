/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
//var express=require('express');
var expect = require('chai').expect;
var mongo = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
//var app = express();

require('dotenv').config();// have to bring in the dotenv dependencies, otherwise you can't read the enviroment variable.

var CONNECTION_STRING = process.env.DB;


module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      var project = req.params.project;
      var query = req.query;
     //console.log(query);
      
      mongo.connect(CONNECTION_STRING, (err, db) => {
        if (err) res.json(err);
        db.collection("issues").find(query).toArray((err, issue) => {
          res.json(issue);
          db.close();
        })

      })

    })

    

    .post(function (req, res) {
      var project = req.params.project;
      if (req.body.issue_title === "" || req.body.issue_text === "" || req.body.created_by === "") {
        console.log(res.text);
        res.send("Please fill in the required filed")
      } else {
        var newIssue = {
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to,
          status_text: req.body.status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: "true",
        }
        mongo.connect(CONNECTION_STRING, (err, db) => {
          if (err) res.json(err);
          var issues = db.collection("issues");
          issues.save(newIssue, (err, issue) => {
           // console.log(issue);
            res.json(issue.ops[0]);
            db.close();
          })
        })
      }
    })

    

    .put(function (req, res) {
      var project = req.params.project;
      var Issue = req.body;
      var id = req.body._id;
      //console.log(id);
      var query = { _id: ObjectId(id) };
     // query = { _id:id };
  
      function updateBody(obj) {     
        Object.keys(obj).map((key) => {
          if (obj[key] === "") { delete obj[key] }
        }
        )
        return obj;
      }
  
      var updatedIssue = updateBody(Issue);
     // console.log(updatedIssue);
     delete updatedIssue['_id'];
      
  
      if (Object.keys(updatedIssue).length === 0) { return res.send("no updated field sent") };
       updatedIssue.updated_on=new Date();
      // console.log(updatedIssue);
        mongo.connect(CONNECTION_STRING, (err, db) => {
  
          db.collection("issues").updateOne(query, { $set:updatedIssue }, (err, issue) => {
            if (err) { throw err }
            else if (issue.result.n===0) { return res.send('could not update'+id); }
            else {
              //console.log(issue);
             return res.send("successfully updated") }
            db.close();
          })
  
        })
      
    })
    .delete(function(req,res){
      var project = req.params.project;
      var id=req.body._id;     
      var query={_id:ObjectId(id)};
      mongo.connect(CONNECTION_STRING,(err,db)=>{
        if(!Object.prototype.hasOwnProperty.call(req.body,"_id")){return res.send("_id error")} 
        db.collection("issues").remove(query,(err)=>{
          if (err){res.json('could not delete'+id)}
          else{
            return res.send('deleted '+id) //don't forget use return
          }
          db.close()
        })
      })
  
    })
    


};


