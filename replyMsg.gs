function replyMsg(replyToken, flex) {
let response
  try {
      const option = {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + CHANALACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'replyToken': replyToken,
          'messages': flex
        })
      };
      response = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", option);
  }catch (error){
    Logger.log(error.name + "：" + error.message)
    return;
  }finally{
    Logger.log(response.getResponseCode())
  }
}
