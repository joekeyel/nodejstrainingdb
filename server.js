const express = require('express');
const morgan  = require('morgan')

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

  console.log("tunnel connected")



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

  connection.execute(
    `SELECT *
     FROM DC_USER`,
    [],  
   function(err, result) {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log(result.rows);
      res.send({"users":result.rows});
   });

  
})


const callapi3 = app.get('/api/DC_NE_UTILIZATION/:siteName',(req,res)=>{

  connection.execute(
    `select (select count(*) from dc_rack d2 where d2.rack_site_id=d.rack_site_id and d2.rack_status='Unoccupied' group by rack_site_id)rack_utilized,
    (select count(*) from dc_rack d3 where d3.rack_site_id=d.rack_site_id and d3.rack_status='Registered' group by rack_site_id)rack_available,
    count(*) as total_rack,
    (select round(count(*)*100 / (select count(*) from dc_rack d4 where d4.rack_site_id=d.rack_site_id group by rack_site_id)) from dc_rack d2 where d2.rack_site_id=d.rack_site_id and d2.rack_status='Unoccupied' group by rack_site_id)rack_utilization
    from dc_rack d
    where d.rack_site_id=(select S.SITE_ID from dc_site s where s.site_name =:siteName)
    group by rack_site_id`,
    [req.params.siteName],  
   function(err, result) {
      if (err) {
        console.error(err.message);
        return;
      }
      console.log(result.rows);
      res.send({"sitename":result.rows});
   });

  
})





//api dc_cage
require('./dcportalapi/DC_CAGE')(app);


const PORT = process.env.PORT || 5005;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));