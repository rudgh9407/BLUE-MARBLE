const express = require('express');
const mysql = require('mysql');
const body_parser = require('body-parser');
const app = express();
const con = mysql.createConnection({
  host: 'localhost',
  user: 'c16st10',
  password: '**************',
  database: 'c16st10'
});
app.use(express.static(__dirname + '../../'));
app.locals.pretty = true
app.set('view engine', 'pug');
app.set('views', './src/pug/');
app.use(body_parser.urlencoded({extended: false}));

app.get('/marble', (req,res)=>{
  console.log('/marble URL Connected');
  let select_list = `SELECT * FROM marble ORDER BY win DESC, loss ASC`;
  con.query(select_list, (err, result, field)=>{
    // if(err) throw err;
    res.render('marble', {list: result});
  })
});

app.post('/marble', (req,res)=>{
  console.log('POST SEND DATA');
  let new_check = [0, 0];
  let win_name = req.body.win_name;
  let loss_name = req.body.loss_name;
  let name_list = [win_name, loss_name];
  let win_count = [1, 0];   //--- 승자 승, 패 횟수
  let loss_count = [0, 1];    //--- 패자 승, 패 횟수
  let count_list = [win_count, loss_count];
  let select_list = `SELECT * FROM marble ORDER BY win DESC, loss ASC`;
  con.query(select_list, (err, result, field)=>{
    // if(err) throw err;
    result.forEach((v,i,a)=>{
      if(v.name == win_name){
        win_count[0] += v.win;
        win_count[1] += v.loss;
        new_check[0] = 1;
      }
      if(v.name == loss_name){
        loss_count[0] += v.win;
        loss_count[1] += v.loss;
        new_check[1] = 1;
      }
    })
    new_check.forEach((v,i,a)=>{
      if(v == 0) {
        con.query(`INSERT INTO marble (name, win, loss) VALUES ("${name_list[i]}", ${count_list[i][0]}, ${count_list[i][1]})`, (err,result,field)=>{});
      } else {
        console.log( count_list[i][0] + ' / ' + count_list[i][1] + ' / ' + name_list[i] );
        con.query(`UPDATE marble SET win=${count_list[i][0]}, loss=${count_list[i][1]} WHERE name = "${name_list[i]}"`, (err,result,field)=>{});
      }
    })
    setTimeout(()=>{ res.redirect('/marble'); }, 500);
  })
})

app.listen('30102', (req,res)=>{
  console.log('BLUE MARBLE SERVER CONNECTED');
})
