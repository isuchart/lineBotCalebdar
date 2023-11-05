
let CHANALACCESS_TOKEN = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" //chanalaccess Token Line Oa

const Logger = BetterLog.useSpreadsheet("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); // ไอดี sheets

const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ชีต1') // เปลี่ยนชื่อชีตให้ตรงกัน

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  postData.events.forEach((event)=>{
    Logger.log(JSON.stringify(event))
    const replyToken = event.replyToken
    const eventType = event.type
    const uid = event.source.userId
    if (eventType === 'message' && event.message.type === "text"){
      let messageText = event.message.text;
      handleMessage(replyToken, messageText, uid);
    }else if(eventType === 'message' && event.message.type === "location"){
      Logger.log("locationจ้า")
    }else if(eventType === 'postback'){
      handlePostback(replyToken, event, uid)
    }

  })  



  // const replyToken = postData.events[0].replyToken;
  // const eventType = postData.events[0].type; // ดึงประเภทของ event

  // if (eventType === 'message' && postData.events[0].message.type === "text" ) {
  //   let messageText = postData.events[0].message.text;
  //   handleMessage(replyToken, messageText);
  // }else if(eventType === 'postback'){
  //   handlePostback(replyToken, postData.events[0])
  // }

  return ContentService.createTextOutput(JSON.stringify({ success: true }));
}



function handleMessage(replyToken, messageText, uid) {

  Logger.log(messageText)
  Logger.log(uid)
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0'); // เพิ่ม leading zero ถ้าหากเดือนเป็นเลขเดียว
const day = String(today.getDate()).padStart(2, '0'); // เพิ่ม leading zero ถ้าหากวันเป็นเลขเดียว

var initialDate = `${year}-${month}-${day}`;


  if ((messageText.match(/calendar/)) ? messageText : undefined ) {
    callCalendar(replyToken, messageText);

  }else if(messageText === "location"){
    let flexlocation = [{
      "type": "text",
      "text": "Please share your location",
      "quickReply": {
        "items": [
          {
            "type": "action",
            "action": {
              "type": "location",
              "label": "Send Location"
            }
          }
        ]
      }
    }
    ]
       
  replyMsg(replyToken,flexlocation)

  }else if(messageText === "add"){ 
    const flexadd = [{
      "type": "flex",
      "altText": "calendar",
      "contents": {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": "https://appsamurai.com/wp-content/uploads/2023/02/postback_blogcover.png",
          "size": "full",
          "aspectRatio": "20:13",
          "aspectMode": "cover",
          "action": {
            "type": "uri",
            "uri": "http://linecorp.com/"
          }
        },
        "body": {
          "type": "box",
          "layout": "vertical",
          "contents": [
            {
              "type": "button",
              "action": {
                "type": "datetimepicker",
                "label": "เลือกวันที่",
                "data": "วันที่",
                "mode": "date",
                "initial": initialDate,
                "max": "2024-12-25",
                "min": "2023-01-01"
              },
              "style": "primary",
              "height": "sm"
            }
          ]
        }
      }
  }]


    return replyMsg(replyToken, flexadd)

  }
  else if((messageText.match(/addกิจกรรม/)) ? messageText : undefined){
    let act = messageText.split(":")[1]
    Logger.log(act)
    let selectedDate = PropertiesService.getScriptProperties().getProperty('dateA');
    let userIdCach = PropertiesService.getScriptProperties().getProperty('Uid');

    if (selectedDate && userIdCach === uid) {
      const idRecord = generateAutoNumber();
      ss.appendRow([idRecord,selectedDate,act.trim()])
      // ลบค่า selectedDate จาก Properties
      PropertiesService.getScriptProperties().deleteProperty('dateA');

          let flexOk = [
            {
  "type": "flex",
  "altText": "บันทึกกิจกรรมเรียบร้อย",
  "contents": {
    "type": "bubble",
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": [
        {
          "type": "text",
          "text": "บันทึกกิจกรรมเรียบร้อย",
          "size": "xl",
          "align": "center",
          "color": "#FF69B4"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "horizontal",
      "contents": [
        {
          "type": "button",
          "action": {
            "type": "message",
            "label": "ดูปฏิทินตอนนี้",
            "text": "calendar/"+(new Date(selectedDate).getMonth()+1)
          },
          "style": "primary"
        }
      ]
    }
  }
}

          ]

          return replyMsg(replyToken, flexOk)
    } else {
      // Logger.log("ไม่พบค่า selectedDate");
            let flexMsg = [
        {
          "type": "flex",
          "altText": "Please Select Date",
          "contents": {
            "type": "bubble",
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "กรุณาเลือกวันที่",
                  "weight": "bold",
                  "size": "xl"
                }
              ]
            },
            "footer": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "button",
                  "action": {
                    "type": "datetimepicker",
                    "label": "เลือกวันที่",
                    "data": "วันที่",
                    "mode": "date",
                    "initial": initialDate,
                    "max": "2024-12-25",
                    "min": "2023-01-01"
                  }
                }
              ]
            }
          }
        }
      ];
      replyMsg(replyToken, flexMsg);
    }
  }
  else if((messageText.match(/remove/)) ? messageText : undefined){
    let idEvent = messageText.split("/")[1]
    // Logger.log(idEvent)
    const col1 = ss.getRange(2,1,ss.getLastRow(),1).getDisplayValues().map(r=>r[0])
    const rowIdx = col1.indexOf(idEvent)
      if(rowIdx > -1){
    // Logger.log(rowIdx+2)
      let dataRow = ss.getRange(rowIdx+2,1,1,3).getDisplayValues()
      ss.deleteRow(rowIdx+2)
      // Logger.log(dataRow)
            let flexDelete = [
              {
                "type": "flex",
                "altText": "ลบกิจกรรมเรียบร้อย",
                "contents": {
                  "type": "bubble",
                  "body": {
                    "type": "box",
                    "layout": "vertical",
                    "contents": [
                      {
                        "type": "text",
                        "text": "ลบกิจกรรม",
                        "size": "xl",
                        "align": "center",
                        "color": "#FF69B4",
                        "wrap": true
                      },
                      {
                        "type": "text",
                        "text": dataRow[0][2] + "\nวันที่ " + dataRow[0][1] + "\nเรียบร้อยแล้ว",
                        "size": "md",
                        "align": "center",
                        "wrap": true
                      }
                    ]
                  },
                  "footer": {
                    "type": "box",
                    "layout": "horizontal",
                    "contents": [
                      {
                        "type": "button",
                        "action": {
                          "type": "message",
                          "label": "ดูปฏิทินตอนนี้",
                          "text": "calendar/"+(new Date(dataRow[0][1]).getMonth()+1)
                        },
                        "style": "primary"
                      }
                    ]
                  }
                }
              }
            ]

            return replyMsg(replyToken, flexDelete)  
      }
  }
}

function handlePostback(replyToken, postData, uid) {

  const postbackData = postData.postback.data

  Logger.log("postbackData "+postbackData)
  if (postbackData === "วันที่") {
    const selectedDate = postData.postback.params.date 
    Logger.log(`วันที่ที่เลือก: ${selectedDate}`);
    
    // บันทึกวันที่ที่ผู้ใช้เลือกไว้ในตัวแปร

    // เก็บ selectedDate ใน Properties
    PropertiesService.getScriptProperties().setProperty('dateA', selectedDate);    
    // เก็บ uid ใน Properties
    PropertiesService.getScriptProperties().setProperty('Uid', uid);       
    // แสดง Flex Message เพื่อให้กรอก(กิจกรรม)
    const flexAct = [
                    {
                      "type": "flex",
                      "altText": "This is an Activity Message",
                      "contents": {
                        "type": "bubble",
                        "body": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {
                              "type": "text",
                              "text": "กรุณากรอกกิจกรรม",
                              "weight": "bold",
                              "size": "xl"
                            }
                          ]
                        },
                        "footer": {
                          "type": "box",
                          "layout": "vertical",
                          "contents": [
                            {
                              "type": "button",
                              "style": "primary",
                              "color": "#FF6F61",
                              "action": {
                                "type": "postback",
                                "label": "กิจกรรม",
                                "data": "เพิ่มกิจกรรม",
                                "inputOption": "openKeyboard",
                                "fillInText": "addกิจกรรม : "
                              }
                            }
                          ]
                        }
                      }
                    }
                  ]

                  return replyMsg(replyToken, flexAct)

  }//end if "วันที่"
  else if (postbackData === "เพิ่มกิจกรรม") {
    Logger.log("activity");


  }
}


function generateAutoNumber() {
    try {
      var lastRow = ss.getLastRow();
      var lastValue = 10000;

      if (lastRow > 0) {
        var lastCellValue = ss.getRange(lastRow, 1).getValue();
        if (!isNaN(lastCellValue) && isFinite(lastCellValue)) {
          lastValue = parseInt(lastCellValue);
        }
      }
      var newNumber = lastValue + 1;
      Logger.log(newNumber)
      return newNumber
    } catch (error) {
      Logger.log(error.message)
    }
}



