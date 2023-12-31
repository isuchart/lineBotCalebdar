# พัฒนา Line Bot Calendar ด้วย Appscript 5/11/2023

**

## แนวคิด
		

ผมได้มีโอกาสศึกษาเพิ่มเติมเรื่องของการจัดการข้อมูลวันที่ รวมไปถึงการทำปฏิทินด้วย webapp จากหลายๆ ซึ่งส่วนใหญ่ใช้เป็นการสร้างในส่วน Html Javascript และ ตกแต่งด้วย css หลายๆ ตัวอย่าง ซึ่งเค้าทำออกมาแล้วมันเป็นพื้นฐานของการทำความเข้าใจได้หลายอย่าง อาทิ เรื่องการจัดการข้อมูล Date Time รวมถึงการเขียน Css พื้นฐานที่มีหลายจุดที่ผมได้ทำความเข้าใจ เลยเกิดความคิดว่า แล้วถ้านำปฏิทินมาใส่ใน Flex messeage ของ Line นี่คงน่าจะสนุก ก็เลยได้ลองนำแนวทางมาพัฒนาเป็น line bot Calendar ที่สามารถส่ง Flex message แบบ Dynamic ตามเดือนที่ต้องการได้เลย ซึ่งผมคิดว่ามีประโยชน์มากๆ ทั้งสามารถนำไปประยุกต์กับอย่างอื่นได้อีกเยอะเลย ดังนั้นก็เลยพยายามหาวิธีการพัฒนาจากหลายส่วน ทั้งหลักการพื้นฐานการสร้างปฏิทิน,พื้นฐานความเข้าใจเรื่อง Flex message, การตรวจสอบค่า True False เมื่อเปรียบเทียบวันที่ในปฏิทินและวันที่ของกิจกรรมที่จะระบุ ทั้งหมดนี้แล้วจึงวางแนวทางการพัฒนา ได้แก่

 1. คำนวณเดือนปัจจุบันที่ต้องการแสดง
 2. กรองกิจกรรมที่ตรงกับเดือนที่กำหนด
 3. กำหนดหัวข้อ Flex Message ของปฏิทินโดยอิงจากกิจกรรมที่เลือก
 4. คำนวณข้อมูลเกี่ยวกับปฏิทิน เช่น จำนวนวันในเดือน, วันแรกของเดือน, วันเริ่มต้นของสัปดาห์, และข้อมูลของเดือนที่ผ่านมา
 5. สร้าง Flex Message โดยแบ่งเป็นแถวและคอลัมน์ตามโครงสร้างของปฏิทิน
 6. สร้าง Bubble Container ของ Flex Message โดยรวมถึงข้อมูลทั้งหมดที่ต้องการแสดง (เช่น ชื่อเดือน, ปฏิทิน,หัวข้อกิจกรรม)
 7. ส่ง Flex Message กลับไปยัง LINE Messaging API

## เริ่มการคำนวณต่างๆ ที่จำเป็นในการพัฒนา
```javascript 
const  today = new  Date();
const  currentMonth = thaiMonths[today.getMonth()]; //พฤศจิกายน
const  currentYear = today.getFullYear(); // 2023
        
 /** หาจำนวนวันในเดือนปัจจุบัน */
const  daysInMonth = new  Date(currentYear,
today.getMonth() + 1, 0).getDate(); //30 

/** หาวันแรกของเดือนปัจจุบัน */
const  firstDayOfMonth = new  Date(currentYear, today.getMonth(), 1); //Wed Nov 01 2023 00:00:00 GMT+0700 (Indochina Time)

/** หาว่าวันที่ 1 ของเดือนเป็นวันอะไร อ - ส */
const  startingDayOfWeek = firstDayOfMonth.getDay(); //3 // Sunday - Saturday : 0 - 6
```
จากการคำนวณค่าต่างๆ แล้วก็มาทำการจัดการในส่วน ปฏิทินโดยใช้ For loop

## 1. Loop For วันที่ก่อนหน้าวันที่ 1 ของเดือนที่เลือก

 จัดการส่วนวันที่ของเดือนก่อนหน้าเดือนที่จะสร้างปฏิทิน เพื่อหาว่าในแถวแรกของปฏิทินจะต้องแสดงวันที่ก่อนหน้า วันที่ 1 ของเดือนที่เลือกหรือไม่ โดยนำค่าวันสุดท้ายของเดือนก่อนหน้ามา ลบกับค่าของวันแรกในสัปดาห์(อ-ส) Sunday = 0, Monday = 1, ... จากนั้น นำมาบวกกับ i หรือ index ขณะที่วน loop และนำมาบวกเพิ่ม 1 เนื่องจากวันในสัปดาห์จะถูกมองเป็น index ซึ่งเริ่มต้นที่ 0 จากนั้นเก็บ ค่า วันที่ที่ได้รับ มา push ใส่ใน array Row[0]

```javascript 
  for (let i = 0; i < startingDayOfWeek; i++) {
    rows[currentRow].push({ 
      type: 'box',
      layout: 'vertical',
      borderColor: "#B2C8BA",
      borderWidth: "2px",  
      alignItems: "center",
      cornerRadius: "5px",
      paddingAll: "sm",
      contents: [
        {
          type: 'text',
          text: `${lastMonthLastDay - startingDayOfWeek + i + 1}`,
          color: "#EAD7BB",
          flex: 1,
        }
      ]
    });
  }
```
## 2. Loop For วันที่ทั้งหมดของเดือนที่จะสร้างปฏิทิน

เก็บค่าวันที่ทั้งหมดของเดือนที่จะสร้างด้วยการ Loop for เหมือนเดิมแต่คราวนี้เราจะง่ายขึ้นด้วยการวนเก็บค่าจาก 0 ไปจนถึง จำนวนวันที่อยู่ในเดือนที่จะสร้างปฏิทิน(daysInMonth) นอกจากนี้เราจะมีการตรวจสอบ array กิจกรรมของเราที่จะทำให้ปฏิทินเรามีการ highlight วันที่ให้แตกต่างหากตรงกับวันที่ที่เราบันทึกกิจกรรมลงไปในฐานข้อมูล ทั้งนี้เราจะใช้ [# Array.prototype.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some)
ในการตรวจสอบว่า ค่าที่มีในกิจกรรม ตรงกับวันที่กำลัง loop อยู่หรือไม่ซึ่งจะคืนผลลัพธ์ มาเป็น ค่า True - False ทีนี้เราก็สบายล่ะ รู้ทันทีว่าอ่อวันนี้ล่ะมีกิจกรรมก็แค่ปรับรูปแบบ flex ที่ต้องการใส่ไว้ที่ตัวแปร isHighlightDay  ซึ่งในที่นี้ผมทำให้เป็นสีแดง แตกต่างจากวันปกติที่เป็นสีน้ำเงิน และในส่วนนี้จะสังเกตว่า ผมใช้คำสั่ง currentRow++; เพื่อแปลง currentRow ที่เดิมเป็น 0 ให้มันกลายเป็น 1...2...3 ไปเรื่อยๆ จนครบ หรือหมายถึงสร้างหรือขึ้นแถวใหม่เพิ่มขึ้นไปหาก ครบ 7 วันแล้ว
```javascript 
  for (let i = 1; i <= daysInMonth; i++) {
    let isHighlightDay = highlightedDates.some(dateObj => dateObj.date === `${currentYear}/${today.getMonth() + 1}/${i}`);
   
    if (rows[currentRow].length === 7) {
      currentRow++;
      rows[currentRow] = [];
    }
    rows[currentRow].push({ 
      type: 'box',
      layout: 'vertical',
      borderColor: "#B2C8BA",
      borderWidth: "2px",  
      alignItems: "center",
      cornerRadius: "5px",
      paddingAll: "sm",
      contents: [
        {
          type: 'text',
          text: `${i}`,
          color: isHighlightDay ? "#FF0000" : "#0802A3",
          flex: 1,
        }
      ]
    });
  }
```
## 3. Loop For วันที่ของเดือนถัดไปที่อาจต้องแสดงในแถวสุดท้ายของปฏิทิน

ขั้นสุดท้ายล่ะ หลังจากที่เราได้วันครบทักวันของเดือนนั้น ผมก็มาพบว่า อ้าวเห้ย ปฏิทินผมมันแหว่งแถวสุดท้ายและมันแสดงข้อมูลไม่ตรงกับแถวอื่น เนื่องจากค่า array ในแถวสุดท้ายบางเดือนมันไม่ถึง 7 วัน let i = rows[currentRow].length; i < 7; i++ เลยต้องมาจัดการส่วนของแถวสุดท้ายไปอีก โดยการการใช้ สร้าง array แถวสุดท้ายไว้ด้วย ผมนำจำนวนค่าใน array ทั้งหมดในแถวนั้นๆ มาทำการ ทำการเติมช่องว่างหัวใจให้เต็มด้วยการนำ let nextMonthDayCounter = 1; มาเติมในช่องว่าง และอ่อ เราต้องเติมให้ครบแถวด้วย เช่นแถวสุดท้ายเราวันที่ 30 ตรงกับวัน พุธ นั่นทำให้วันอื่นในแถวเราจะเป็นค่าว่างซึ่งมันจะไม่สวยงาม ดังนั้นก็จับ nextMonthDayCounter = 1; มาบวกเพิ่มไปเรื่อย nextMonthDayCounter++;
```javascript 
  let nextMonthDayCounter = 1;
        for (let i = rows[currentRow].length; i < 7; i++) {
          rows[currentRow].push({ 
            type: 'box',
            layout: 'vertical',
            borderColor: "#B2C8BA",
            borderWidth: "2px",  
            alignItems: "center",
            cornerRadius: "5px",
            paddingAll: "sm",
            contents: [
              {
                type: 'text',
                text: `${nextMonthDayCounter}`,
                flex: 1,
                color: "#EAD7BB"
              }
            ]
          });
          nextMonthDayCounter++;
        }
```
โอ๊ยจบสักทีกับ ปฏิทิน หัวจะปวด ครับ ทีนี้ก็เรื่องของ เราล่ะ Flex ! บ้าไปแล้ว ทำใน webapp ก็แย่แล้วแล้วจะสร้างเป็น Flex ได้เหรอ? Flex ทำมะดาโลกไม่จำเลยต้องให้มัน เปลี่ยนได้ตามใจฉันด้วย เอ่อ เอาสิ จากด้านบนจะเห็นว่าแน่นอนผมก็อาศัยหลักการเดียวกับ webapp นั่นแหละ เพียงแต่ผมก็ต้องไปนั่งศึกษาทำความเข้าใจฝึกใช้ flex simulater มาด้วย รวมถึงค่อยๆ ถอด json มาทีละชุดเพื่อให้มัน dynamic ได้ดังใจนึก

**

## จากนั้นเราก็ไปจัดการในส่วน line OA กันบ้าง สร้าง Bot ขึ้นมาตามปกติ แล้ว Deploy ตัว appscript แล้วนำลิงค์ที่ Deploy ไปใส่เป็น Webhook ได้เลย keyword ตามโค๊ดนี้ ได้แก่

 - ต้องการสร้างกิจกรรมเพิ่มในปฏิทิน ให้พิมพ์ข้อความ add จากนั้น bot จะให้เราป้อนวันที่ เราก็เลือกกำหนดวันที่ของกิจกรรมเรา และต่อมา bot จะส่ง Flex มา1ชุดเพื่อให้เรากดเพิ่มกิจกรรม ป้อนกิจกรรมใน กล่องป้อนข้อความต่อจากคำที่ bot ส่งมาได้เลย แล้วกดส่ง bot จะตอบว่า บันทึกกิจกรรมสำเร็จ เราสามารถคลิกปุ่มดูปฏิทินของเราตามเดือนที่เรากำหนดไปได้เลย
 - ต้องการ ดูปฏิทินของเดือนใหนก็ให้ป้อนข้อความว่า calendar/ตามด้วยเลขเดือนเช่นต้องการดูปฏิทิน เดือน พฤศจิกายน ก็ป้อนข้อความว่า calendar/11
 - ต้องการลบกิจกรรมของวันใหนให้ใช้การอ้างอิง id ของกิจกรรมนั้น ดูจากปฏิทินที่มีกิจกรรมที่เราต้องการลบออกไป แล้วป้อนข้อความ ว่า remove/ตามด้วยเลข id กิจกรรม เช่น remove/10004 ระบบจะลบกิจกรรมนั้นทันทีและส่ง flex มาให้เราเพื่อกดดูผลลัพธ์ได้ด้วย

## สุดท้ายแล้ว ผมทำไปทำมาอยากให้ประทับใจด้วยการเพิ่มลูกเล่นกลายเป็นบอทเฉยเลย มีการเพิ่ม- ลบ และ เรียกดูปฏิทินได้ จนเกิดมาเป็นบทความนี้ครับ ขอบคุณทุกท่านที่ติดตามนะครับ ขอให้สนุกและให้ปวดหัวพอๆ กับผมด้วยเถิด 5555555555555555555555

**กรุณาอย่านำโค๊ดผมไปจำหน่ายหรือทำเพื่อการค้าเลยนะครับ เมตตาผมเถอะ ผมไม่ได้หวงนะครับ แต่ผมจี๊ด ครับ**

**