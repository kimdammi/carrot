/**
 * @filename    : regex_helper.js
 * @author      : 김다미(worudekgks@gmail.com)
 * @description : 정규표현식 검사 수행 후, true/false로 해당 정규표현식 충촉하는지 여부를 반환하는 함수들의 모음
 */
const BadRequestException = require('../exceptions/BadRequestException');

class RegexHelper {
  //의미없는 생성자는 안쓰는 것이 좋음
  // constructor() {}

  /**
   * 값의 존재 여부를 검사한다.
   * @param   {string} value      검사할 값
   * @param   {string} msg        값이 없을 경우 표시할 메시지 내용
   */
  value(content, msg) {
    if(content == undefined || content == null || content.trim().length==0){
      throw new BadRequestException(msg);
    }

    return true;
  }

  /**
   * 입력값이 지정된 글자수를 초과했는지 검사한다.
   * @param   {string} content      검사할 값
   * @param   {int}   len         최대 글자수
   * @param   {string} msg        값이 없을 경우 표시할 메시지 내용
   * @return  {boolean}   입력된 경우 true/ 입력되지 않은 경우 false
   */
  max_length(content, len, msg) {
    if (!this.value(content) || content.length > len) {
      throw new BadRequestException(msg);
    }
    return true;
  }

  /**
   * 입력값이 지정된 글자수 미만인지 검사한다.
   * @param   {string} selector   입력요소에 해당하는 CSS 선택자
   * @param   {int}   len         최소 글자수
   * @param   {string} msg        값이 없을 경우 표시할 메시지 내용
   * @return  {boolean}   입력된 경우 true/ 입력되지 않은 경우 false
   */
  min_length(selector, len, msg) {
    if (!this.value(content) || content.length < len) {
      throw new BadRequestException(msg);
    }
    return true;
  }


  /**
   * 두 값이 동일한지 검사한다.
   * @param   {string} origin   원본 요소의 selector
   * @param   {string} compare   검사 대상 요소의 selector
   * @param   {string} msg        검사에 실패한 경우 표시할 메시지
   * @return  {boolean}   동일한 경우 true/ 다른 경우 false
   */
  compare_to(origin, compare, msg) {
    var src = origin.trim(); // 원본값을 가져온다.
    var dsc = compare.trim(); // 비교할 값을 가져온다.

    if (src != dsc) {
      throw new BadRequestException(msg);
    }
    return true; // 성공했음을 리턴
  }

  /**
   * 입력값이 정규표현식을 충족하는지 검사한다.
   * @param   {string} content   입력내용
   * @param   {string} msg        표시할 메시지
   * @param   {object} regex_expr 검사할 정규표현식
   */
  // const k = /^[0-9]*$/.test("검사할 내용");
  field(content, msg, regex_expr) {
    var src = content.trim(); // 입력값을 가져온다.

    // 입력값이 없거나 입력값에 대한 정규표현식 검사가 실패라면?
    if (!src || !regex_expr.test(src)) {
      throw new BadRequestException(msg);
    }
    return true; // 성공했음을 리턴
  }

  /**
   * 숫자로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  num(content, msg) {
    return this.field(content, msg, /^[0-9]*$/);
  }

  /**
   * 영문으로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  eng(content, msg) {
    return this.field(content, msg, /^[a-zA-Z]*$/);
  }

  /**
   * 한글로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content  입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  kor(content, msg) {
    return this.field(content, msg, /^[ㄱ-ㅎ가-힣]*$/);
  }

  /**
   * 영문과 숫자로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  eng_num(content, msg) {
    return this.field(content, msg, /^[a-zA-Z0-9]*$/);
  }

  /**
   * 한글과 숫자로만 이루어 졌는지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content  입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  kor_num(content, msg) {
    return this.field(content, msg, /^[ㄱ-ㅎ가-힣0-9]*$/);
  }

  /**
   * 이메일주소 형식인지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  email(content, msg) {
    return this.field(
      content,
      msg,
      /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
    );
  }

  /**
   * 핸드폰 번호 형식인지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  cellphone(content, msg) {
    return this.field(content, msg, /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/);
  }

  /**
   * 집전화 형식인지 검사하기 위해 field()를 간접적으로 호출한다.
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  tellphone(content, msg) {
    return this.field(content, msg, /^\d{2,3}\d{3,4}\d{4}$/);
  }

  /**
   * 핸드폰 번호과 집전화 번호 형식 둘중 하나를 충족하는지 검사
   * @param   {string} content   입력요소에 해당하는 CSS 선택자
   * @param   {string} msg        표시할 메시지
   * @return  {boolean}   표현식을 충족할 경우 true/ 그렇지 않은 경우 false
   */
  phone(content, msg) {
    var check1 = /^01(?:0|1|[6-9])(?:\d{3}|\d{4})\d{4}$/; // 핸드폰 형식
    var check2 = /^\d{2,3}\d{3,4}\d{4}$/; //집전화 형식

    var src = content.trim(); // 입력값을 가져온다.

    // 입력값이 없거나,     핸드폰 형식도 아니고      집전화 형식도 아니라면?
    if (!src || (!check1.test(src) && !check2.test(src))) {
      throw new BadRequestException(msg);
    }
    return true; // 성공했음을 리턴
  }
}

module.exports = new RegexHelper();
