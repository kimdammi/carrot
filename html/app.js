/**
 * professor 테이블에 대한 CRUD 기능을 수행하는 Restful API
 */

/** (1) mysql 모듈 불러오기 */

/*----------------------------------------------------------
 | 1) 모듈참조
 -----------------------------------------------------------*/
 const config = require('./helper/_config');  // 앱 세팅하는 것
 const logger = require("./helper/LogHelper");
 const util = require("./helper/UtilHelper");
 const fileHelper = require("./helper/FileHelper");
 const webHelper = require("./helper/WebHelper");  //오류일괄처리코드
 // 내장 모듈
 const url = require("url");
 const path = require("path");
 
 // 설치가 필요한 모듈
 const express = require("express"); // Express 본체
 const useragent = require("express-useragent"); // 클라이언트의 정보를 조회할 수 있는 기능
 const static = require("serve-static"); // 특정 폴더의 파일을 URL로 노출 시키는 기능
 const favicon = require("serve-favicon"); //favicon 처리
 const bodyParser = require("body-parser"); // POST 파라미터 처리
 const methodOverride = require("method-override"); // PUT 파라미터 처리
 const cookieParser = require("cookie-parser"); // Cookie 처리
 const expressSession = require("express-session"); //Session 처리
 const multer = require("multer"); //업로드 모듈
 const nodemailer = require("nodemailer"); //메일발송 --> app.use()로 추가 설정 필요없음. 이 자체로 함수
 const thumbnail = require("node-thumbnail").thumb; //썸네일 이미지 생성 모듈
 const { connected } = require("process");
 var ExpressMysqlSession = require("express-mysql-session")(expressSession);
 
 
 const BadRequestException = require("./exceptions/BadRequestException");
 const PageNotFoundException = require("./exceptions/PageNotFoundException");
 const RuntimeExceptionn = require("./exceptions/RuntimeException");
/*----------------------------------------------------------
 | 2) Express 객체 생성
 -----------------------------------------------------------*/
// 여기서 생성한 app 객체의 use() 함수를 사용해서
// 각종 외부 기능, 설정 내용, URL을 계속해서 확장하는 형태로 구현이 진행된다.
const app = express();

/*----------------------------------------------------------
 | 3) 클라이언트의 접속시 초기화 -> 접속한 클라이언트의 정보를 파악
 -----------------------------------------------------------*/
/** app 객체에 UserAgent 모듈을 ``탑재 */
// --> Express객체(app)에 추가되는 확장 기능들을 Express에서는 미들웨어라고 부른다.
//  --> 초기화 콜백함수에 전달되는 req, res객체를 확장하기 때문에
//     다른 모듈들보다 먼저 설정되어야 한다.
app.use(useragent.express());

// 클라이언트의 접속을 감지
app.use((req, res, next) => {
  logger.debug("클라이언트가 접속했습니다.");

  // 클라이언트가 접속한 시간
  const beginTime = Date.now();

  // 클라이언트의 IP주소
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // 클라이언트의 디바이스 정보 기록 (UserAgent 사용)
  logger.debug(
    "[client] " +
      ip +
      " / " +
      req.useragent.os +
      " / " +
      req.useragent.browser +
      "(" +
      req.useragent.version +
      ") / " +
      req.useragent.platform
  );

  // 클라이언트가 요청한 페이지 URL
  // 콜백함수에 전달되는 req 파라미터는 클라이언트가 요청한 URL의 각 부분을 변수로 담고 있다.
  const current_url = url.format({
    protocol: req.protocol, // ex) http://
    host: req.get("host"), // ex) 172.16.141.1
    port: req.port, // ex)3000
    parhname: req.originalUrl, // ex) /page1.html
  });

  logger.debug("[" + req.method + "]" + decodeURIComponent(current_url));

  // 클라이언트의 접속이 종료된 경우의 이벤트
  res.on("finish", () => {
    // 접속 종료시간
    const endTime = Date.now();

    // 이번 접속에서 클라이언트가 머문 시간 = 백엔드가 실행하는게 걸린 시간
    const time = endTime - beginTime;
    logger.debug(
      "클라이언트의 접속이 종료되었습니다. ::: [runtime] " + time + "ms"
    );
    logger.debug("---------------------------------------------");
  });

  // 이 콜백함수를 종료하고 요청 URL에 연결된 기능으로 제어를 넘김
  next();
});

/*----------------------------------------------------------
 | 4) Express 객체의 추가 설정
 -----------------------------------------------------------*/
/** POST 파라미터 수신 모듈 설정 */
//   추가 모듈들 중 UserAgent를 제외하고 가장 먼저 설정해야함
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
// extended: true --> 지속적 사용
// extended: false --> 한번만 사용
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text()); // TEXT형식의 파라미터 수신 가능.
app.use(bodyParser.json()); // JSON형식의 파라미터 수신 가능.

/** HTTP PUT, DELETE 전송방식 확장 */
// 브라우저 개발사들이 PUT, DELETE 방식으로 전송하는 HTTP Header이름
app.use(methodOverride("X-HTTP-Method")); // Microsoft
app.use(methodOverride("X-HTTP-Method-Override")); // Google/Gdata
app.use(methodOverride("X-Method-Override")); // IBM
// HTML폼에서 PUT,DELETE로 전송할 경우 post방식을 사용하되, action 주소에 "?_method" 라고 추가
app.use(methodOverride("_method")); // HTML form

/** 쿠키를 처리할 수 있는 객체 연결 */
// cookie-parser는 데이터를 저장,조회 할 때 암호화 처리를 동반한다.
// 이 때 암호화에 사용되는 key문자열을 개발자가 정해야 한다.
const cookie_encrypt_key = "helloworld";
app.use(cookieParser(config.secure.cookie_encrypt_key));

/** favicon 설정 */
app.use(favicon(config.favicon_path));

/** 세션 설정 */
app.use(
  expressSession({
    // 암호화 키
    secret: config.secure.session_encrypt_key,
    // 세션을 쿠키 상태로 클라이언트에게 노출시킬지 여부
    resave: false,
    // 세션이 저장되기 전에 기존의 세션을 초기화 상태로 만들지 여부
    saveUninitialized: false,
    store: new ExpressMysqlSession(config.database)
  })
);

/** req, res 객체의 기능을 확장하는 모듈 */
app.use(webHelper());

/** HTML,CSS,IMG,JS 등의 정적 파일을 URL에 노출시킬 폴더 연결 */
app.use("/", static(config.public_path));
// --> upload 폴더의 웹 상의 위치 : http://아이피:포트번호/upload
app.use("/upload", static(config.upload.dir));
// --> 썸네일 이미지가 생성될 폴더의 웹 상의 위치 : http://아이피:포트번호/thumb
app.use("/thumb", static(config.thumbnail.dir));

/** 라우터(URL 분배기) 객체 설정 --> 맨 마지막에 설정 */ //중요!!!!!!!!!!!!!!!!
const router = express.Router();
// 라우터를 express에 등록
app.use("/", router);



/*----------------------------------------------------------
 | 5) 각 URL별 백엔드 기능 정의
 -----------------------------------------------------------*/
// app.use(require('./controllers/Department')(app));
// app.use(require('./controllers/professor')(app));
// app.use(require('./controllers/Member')(app));

// 런타임 에러가 발생한 경우에 대한 일괄 처리
app.use((err,req,res,next)=>{
  //console.log(err instanceof BadRequestException);
  // 에러객체를 만들 때 생성자 파라미터로 전달한 에러 메시지
  logger.error(err.message);
  // 시스템으로부터의 상세 에러 내용
  logger.error(err.stack);

  if(err instanceof BadRequestException){
    res.sendError(err);
  } else{
    res.sendError(new RuntimeException(err.message));
  }
});

// 앞에서 정의하지 않은 그 밖의 URL에 대한 일괄 처리
app.use("*",(req,res,next)=>{
  const err = new PageNotFoundException();
  res.sendError(err);
});


/*----------------------------------------------------------
 | 6) 설정한 내용을 기반으로 서버 구동 시작
 -----------------------------------------------------------*/
const ip = util.myip();

app.listen(config.server_port, () => {
  logger.debug("---------------------------------------------");
  logger.debug("|            Start Express Server            |");
  logger.debug("---------------------------------------------");

  ip.forEach((v, i) => {
    logger.debug("server address = > http://" + v + ":" + config.server_port);
  });

  logger.debug("---------------------------------------------");
});
