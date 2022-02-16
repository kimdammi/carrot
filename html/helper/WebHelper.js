const logger = require('./LogHelper');
const config = require('./_config');

module.exports=()=>{

    return (req,res,next)=>{

        /** GET,URL,POST,PUT,DELETE 파라미터를 수신하여 값을 리턴하는 함수 */
        // 올바르지 않은 값들을 null처리 해주는 것!
        req._getParam = (method,key,def=null)=>{
            // 파라미터를 HTTP 전송방식에 따라 받는다.
            let value = null;

            // 1) undefined인 경우 def값으로 대체
            // --> 파라미터를 받지만 빈 문자열이거나 공백으로만 구성된 경우는 걸러내지 못한다.
            if(method.toUpperCase() === 'GET'){
                value = req.query[key] || req.params[key] || def;
            }else{
                value = req.body[key] || def;
            }

            // 안들어올 경우 기본값으로 하는 코드
            if(value == undefined){
                value = def;
            }

            // 2) 빈 문자열이거나 공백인 경우 걸러내기
            if (value !== null && typeof value =='string'){
                value = value.trim();

                if(value.length === 0){
                    value = def;
                }
            }

            // 파라미터 가져온 것도 로그로 남긴다!!
            logger.debug('[HTTP %s Params] %s = %s',method,key,value);
            return value;
        };

        /** get 파라미터 수신 함수 --> _getParam 함수를 호출한다.*/
        req.get = function(key,def){
            return this._getParam('GET',key,def);
        };

        /** post 파라미터 수신 함수 --> _getParam 함수를 호출한다.*/
        req.post = function(key,def){
            return this._getParam('PUT',key,def);
        };

        /** put 파라미터 수신 함수 --> _getParam 함수를 호출한다.*/
        req.put = function(key,def){
            return this._getParam('PUT',key,def);
        };

        /** delete 파라미터 수신 함수 --> _getParam 함수를 호출한다.*/
        req.delete = function(key,def){
            return this._getParam('DELETE',key,def);
        };

        /** 프론트엔드에게 JSON 결과를 출력하는 기능 */
        // 응답을 주는 것이기때문에 응답기능 확장
        res.sendResult=(statusCode, message, data)=>{
            const json = {
                'rt': statusCode,
                'rtmsg': message,
            };

            if(data !== undefined){
                for(const key in data){
                    json[key] = data[key];
                }
            }

            json.pubdate = new Date().toISOString();
            res.status(statusCode).send(json);
        };

        /** 에러처리 출력 */
        res.sendError = (error)=>{
            logger.error(error.name);
            logger.error(error.message);
            logger.error(error.stack);
            res.sendResult(error.statusCode, error.message);
        };

        /** 결과가 200(OK)인 경우에 대한 JSON 출력 */
        res.sendJson=(data)=>{
            res.sendResult(200,'OK',data);
        };

        /** 메일발송 */
        // res.sendMail=(...)=>{

        // };

        /** 업로드 초기화 */
        req.getMultipart = ()=>{
            const multipart = multer({
                storage: multer.diskStorage({
                    destination: (req,file,callback)=>{
                        fileHelper.mkdirs(upload_path);
                        console.debug(fileHelper.mkdirs(upload_path));

                        file.dir= upload_path.replace(/\\/gi, '/');
                        callback(null,upload_path);
                    },
                    filename: (req, file, callback)=>{
                        const extName = path.extname(file.originalname);
                        const saveName = new Date().getTime().toString()+extName.toLowerCase();
                        file.savename = saveName;
                        // 업로드 정보에 파일에 접근할 수 있는 URL값 추가
                        file.url = path.join('/upload',saveName).replace(/\\/gi,'/');
                        // 구성된 정보를 req 객체에게 추가
                        if(req.file instanceof Array){
                            req.file.push(file);
                        }else{
                            req.file = file;
                        }
                        callback(null, saveName);
                    },
                }),
            
                /** 용량, 최대 업로드 파일 수 제한 설정 */
                limits:{
                    files: 5,
                    fileSize: 1024*1024*20,
                },
                /** 업로드 될 파일의 확장자 제한 */
                fileFilter: (req, file, callback)=>{
                    // 파일의 종류 얻기
                    var mimetype = file.mimetype;
            
                    // 파일 종류 문자열에 "image/"가 포함되어 있지 않은 경우
                    if(mimetype.indexOf('image/')==-1){
                        const err = new Error();
                        err.result_code = 500;
                        err.result_msg = '이미지 파일만 업로드 가능합니다.';
                        return callback(err);
                    }
                    callback(null,true);
                },
            });

            return multipart;
        };

        next();
    };

};