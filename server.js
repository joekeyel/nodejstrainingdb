const express = require('express');
const morgan  = require('morgan')
const Promise = require("bluebird");
const app = express();
app.use(morgan('combined'))

//check oracle connection
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// bqmdev schema password
var password = 'Tm1m5u5R' 
// checkConnection asycn function
try {

  //untuk windows
 // oracledb.initOracleClient({libDir: 'D:\\POCEXPRESSRESTAPI\\instantclient_19_6'});

  //untuk apple
  oracledb.initOracleClient({libDir: './instantclient_19_3'});
} catch (err) {
  console.error('Whoops!');
  console.error(err);
  process.exit(1);
}



//jump host for nice database

var config = {
  username:'clarity',
  password:'clarity',
  host:'10.54.5.141',
  port:22,
  dstHost:'10.54.8.162',
  dstPort:1521,
  localHost:'127.0.0.1',
  localPort: 1521
};

var tunnel = require('tunnel-ssh');
tunnel(config, function (error, server) {

  if(error){
    console.log(error.message);
  }

  console.log("tunnel jumphost connected")

  //....
});
  


//makeConnection()

const callapi = app.get('/api/location',(req,res)=>{

  async function makeConnection() {
    try {
      connection = await oracledb.getConnection({
          user: "TMIMS",
          password: password,
          connectString: "127.0.0.1:1521/BQMDEV"
      });
      console.log('connected to database');
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection) {
        // try {
        //   // Always close connections
        //   await connection.close(); 
        //   console.log('close connection success');
        // } catch (err) {
        //   console.error(err.message);
        // }
  
        connection.execute(
          `SELECT *
           FROM DC_LOCATION`,
          [],  
         function(err, result) {
            if (err) {
              console.error(err.message);
              return;
            }
            console.log(result.rows);
            res.send(result.rows)
         });
    
      }
    }
  
  
  }
  
  makeConnection()

 
})

const callapi2 = app.get('/api/user',(req,res)=>{

  userId = req.query.userid
      
    

  if (userId != null) {
    query1=" where dcu_id='"+userId+"'";
    }else{
      query1="";
    };
    
    if (userId != null) {
    query2=" and rl_dcu_id='"+userId+"'";
    }else{
      query2="";
    };
    
    if (userId != null) {
    query3=" and ur_dcu_id= '"+userId+"'";
    }else{
      query3="";
    };
      
    if (userId != null) {
    query4=" and uw_dcu_id= '"+userId+"'";
    }else{
      query4="";
    };



  async function makeConnection() {
    try {
      connection = await oracledb.getConnection({
          user: "TMIMS",
          password: password,
          connectString: "127.0.0.1:1521/BQMDEV"
      });
      console.log('connected to database');
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection) {
        // try {
        //   // Always close connections
        //   await connection.close(); 
        //   console.log('close connection success');
        // } catch (err) {
        //   console.error(err.message);
        // }
  
        // connection.execute(
        //   `SELECT *
        //    FROM DC_USER`,
        //   [],  
        //  function(err, result) {
        //     if (err) {
        //       console.error(err.message);
        //       return;
        //     }
        //     console.log(result.rows);
        //     res.send(result.rows)
        //  });



        var query1p =  connection.execute(

          `select t.dcu_id as id,t.dcu_name as name,t.dcu_email as email,t.dcu_admin as user_admin,t.dcu_approve as user_approve,t.dcu_edit as user_edit,
          t.dcu_desc,t.dcu_notification,
          (select 
          LISTAGG('"'||WG_NAME||'"', ' , ') WITHIN GROUP (ORDER BY WG_NAME)
          from (SELECT  UW.UW_DCU_ID,W.WG_NAME FROM DC_USER_WORKGROUP UW, dc_workgroup W
          where uw.uw_wg_id=w.wg_id) where UW_DCU_ID=t.dcu_id) as workgroup
          from DC_USERS t `+ query1,
          [],  
         
          );

          var query2p = connection.execute(
          `SELECT b.ro_name as roles FROM DC_USER_ROLE A, DC_ROLES B
          where a.rl_ro_id=b.ro_id `+ query2,
          []); 

          var query3p = connection.execute(
            `SELECT  r.ur_dcu_id,c.rt_name as rights FROM DC_USER_rights r, dc_rights c
            where r.ur_rt_id=c.rt_id  `+ query3,
            []); 

            var query4p = connection.execute(
              `SELECT  C.WG_NAME as workgroups FROM DC_USER_workgroup r, dc_workgroup c
              where r.uw_wg_id=c.wg_id   `+ query4,
              []); 

          Promise.join(query1p, query2p, query3p, query4p).spread(function (result, result2, result3, result4){

            var rolesarray = [];
            var rightsarray = [];
            var workgrouparray = [];
              
            result2.rows.forEach(element => {
              rolesarray.push(element.ROLES)
            });

            result3.rows.forEach(element => {
              rightsarray.push(element.RIGHTS)
            });

            result4.rows.forEach(element => {
              workgrouparray.push(element.WORKGROUPS)
            });


            res.status(200).send( { user: result.rows, roles: rolesarray , rights: rightsarray, workgroups: workgrouparray});
           // return connection.close();
          })
          .catch(function (err){
            console.log(err.message);
            //return connection.close();
          });
    
      }
    }
  
  
  }

  makeConnection()

})


// to connect 2 db and combine query to get one json response

const callapi3 = app.get('/api/connect2db',(req,res)=>{

  userId = req.query.userid
      
    

  if (userId != null) {
    query1=" where dcu_id='"+userId+"'";
    }else{
      query1="";
    };
    
    if (userId != null) {
    query2=" and rl_dcu_id='"+userId+"'";
    }else{
      query2="";
    };
    
    if (userId != null) {
    query3=" and ur_dcu_id= '"+userId+"'";
    }else{
      query3="";
    };
      
    if (userId != null) {
    query4=" and uw_dcu_id= '"+userId+"'";
    }else{
      query4="";
    };


  var nicedb = false
  var granitedb = false
  //to connect 2 database here

  async function makeConnectionNiceDB() {
    try {
      connection = await oracledb.getConnection({
          user: "TMIMS",
          password: password,
          connectString: "127.0.0.1:1521/BQMDEV"
      });
      console.log('connected to database');
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection) {

        console.log("Connected to niceDB")
        nicedb = true

      }

    }

  }

  makeConnectionNiceDB()

  async function makeConnectionGraniteDB() {
    try {
      connection2 = await oracledb.getConnection({
          user: "TMIMS",
          password: password,
          connectString: "127.0.0.1:1521/BQMDEV"
      });
      console.log('connected to database');
    } catch (err) {
      console.error(err.message);
    } finally {
      if (connection2) {

        console.log("Connected to graniteDB")
        granitedb = true

        console.log("start query here");


        var query1p =  connection2.execute(
    
          `select t.dcu_id as id,t.dcu_name as name,t.dcu_email as email,t.dcu_admin as user_admin,t.dcu_approve as user_approve,t.dcu_edit as user_edit,
          t.dcu_desc,t.dcu_notification,
          (select 
          LISTAGG('"'||WG_NAME||'"', ' , ') WITHIN GROUP (ORDER BY WG_NAME)
          from (SELECT  UW.UW_DCU_ID,W.WG_NAME FROM DC_USER_WORKGROUP UW, dc_workgroup W
          where uw.uw_wg_id=w.wg_id) where UW_DCU_ID=t.dcu_id) as workgroup
          from DC_USERS t `+ query1,
          [],  
         
          );
    
          var query2p = connection.execute(
          `SELECT b.ro_name as roles FROM DC_USER_ROLE A, DC_ROLES B
          where a.rl_ro_id=b.ro_id `+ query2,
          []); 
    
    
          Promise.join(query1p, query2p).spread(function (result, result2){
    
            var rolesarray = [];
            var rightsarray = [];
            var workgrouparray = [];
              
            result2.rows.forEach(element => {
              rolesarray.push(element.ROLES)
            });
    
      
    
            res.status(200).send( { user: result.rows, roles: rolesarray});
            //return connection.close();
          })
          .catch(function (err){
            console.log(err.message);
            //return connection.close();
          });
    

      }

    }

  }

  
  makeConnectionGraniteDB()

  
  
})





//api dc_cage
require('./dcportalapi/DC_CAGE')(app);


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));