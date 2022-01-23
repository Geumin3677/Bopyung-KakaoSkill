const express = require('express');
const app = express();
const logger = require('morgan');
const bodyParser = require('body-parser');

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//app.use('/api', apiRouter);

app.post("/getTime", function(req, res) {
  const action = req.body.action.params;
  const grade = action.grade;
  const classnum = action.class;
  const time = async () => {
    
    let time;
    await timetable.getTimetable().then((result) => {
       time = result[grade][classnum]
    });

    var text;
    text = grade + "학년 " + classnum + "반 시간표\n";
    text += "     월          화          수          목         금\n";
    //time[요일][교시][teacher/subject]
    
    var i = 0;
    while(i < 7) //교시
    {
      text += (i+1) + "  ";

      var j = 0;
      while(j < 5) //요일
      {
        if(time[j][i]["subject"] == '')
        {
          text += "   -    ";
        }
        else
        {
          text += time[j][i]["subject"];
        }
        if(j == 4)
        {
          text += "\n"
        }
        else
        {
          text += "     "
        }
        j += 1;
      }
      i += 1;
    }

    let date = new Date();
    text += "조회일시 - " + (date.getFullYear())+'/'+(date.getMonth()+1)+'/'+date.getDate();

    return res.send({
      version: "2.0",
      template: {
          outputs: [
              {
                  simpleText: {
                      text: text
                  }
              }
          ]
      }
    });
    
    
  };
  time();
  /*
return res.send({
      version: "2.0",
      data:{
        date : (date.getMonth() + 1) + '/' + date.getDate(),
        tt1 : {
          subject : time[0]["subject"],
          teacher : time[0]["teacher"]
        },
        tt2 : {
          subject : time[1]["subject"],
          teacher : time[1]["teacher"]
        },
        tt3 : {
          subject : time[2]["subject"],
          teacher : time[2]["teacher"]
        },
        tt4 : {
          subject : time[3]["subject"],
          teacher : time[3]["teacher"]
        },
        tt5 : {
          subject : time[4]["subject"],
          teacher : time[4]["teacher"]
        },
        tt6 : {
          subject : time[5]["subject"],
          teacher : time[5]["teacher"]
        },
        tt7 : {
          subject : time[6]["subject"],
          teacher : time[6]["teacher"]
        }
      }
    });
  */
});

app.post("/getMeal", function(req, res) {
  const meal = async () => {
    const action = req.body.action.params;
    const wday = action.wday;

    let date = new Date();
   
    if(date.getDay() == 6)
    {
      date.setDate(date.getDate() + (Number(wday) + 2));
    }
    else
    {
      date.setDate((date.getDate() + ((Number(wday) + 1) - date.getDay())));
    }
  
    const meal = await school.getMeal(scfind, date);

    var msg = "조회일시 - " + (date.getFullYear())+'/'+(date.getMonth()+1)+'/'+date.getDate();

    return res.send({
      version: "2.0",
      data:{
        meal : meal,
        date : (date.getMonth()+1)+'/'+date.getDate(),
        msg : msg
      }
    });
  };
  meal();
});

app.post("/getSchoolSc", function(req, res) {
  const sc = async () => {
    try { 
      // const School = require('school-kr');
      // const school = new School();
      // const result = await school.search(School.Region.GYEONGGI, '보평중학교');
      // school.init(School.Type.MIDDLE, School.Region.GYEONGGI, result[0].schoolCode);
      
      const calendar = await school2.getCalendar();

      const date = new Date();

      var calendared = new Object();
      var a = 1;
      var old = 0;
      while(a < (Object.keys(calendar).length - 4))
      { 
        if(calendar[a.toString()] != "")
        {
          if(old == 0)
          {
            calendared.content = (date.getMonth()+1) + '/' + a + ' - ' + calendar[a.toString()];
            old += 1;
          }
          else
          {
            calendared.content += '\n' + (date.getMonth()+1) + '/' + a + ' - ' + calendar[a.toString()];
          }
        }
        a += 1;
      }

      var msg;
      msg = "조회일시 - " + (date.getFullYear())+'/'+(date.getMonth()+1)+'/'+date.getDate();
      
      return res.send({
        version: "2.0",
        data:{
          calendar : calendared,
          msg : msg,
          month : date.getMonth()+1
        }
      });
    } catch(errer) {
      return res.send({
        version: "2.0",
        data:{
          msg : "조회 실패",
        }
      });
    }
  };
  sc();
});



let port = process.env.PORT || 3000;

let school;
let school2;
let scfind;
let timetable;

app.listen(port, function() {
  const setup = async () => {

    const Timetable = require('comcigan-parser');
    timetable = new Timetable();
    await timetable.init();

    const School = require('school-kr');
    school2 = new School();
    let result = await school2.search(School.Region.GYEONGGI, '보평중학교');
    school2.init(School.Type.MIDDLE, School.Region.GYEONGGI, result[0].schoolCode);

    school = require('korean-school');
    scfind = await school.find('경기도', '보평중');

    const school3 = await timetable.search('보평중학교');
    timetable.setSchool(school3[0].code);
  }
  setup();
  console.log('skill server is listening on port 3000!');
});