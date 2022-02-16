// 지금 비동기 처리가 안되서 시간줘서 처리한거임 나중에 다시 해결
setTimeout(function () {
  // 돋보기
  document.querySelector(".fa-search").addEventListener("click", function (e) {
    console.log("search");
    window.location.href = './search.html';
  });

  // // 알림
  // document.querySelector(".fa-bell-o").addEventListener("click", function (e) {
  //   console.log("bell");
  //   window.location.href = './bell.html';
  // });

  // 햄버거바
  document.querySelector(".fa-bars").addEventListener("click", function (e) {
    document.querySelector(".bars").style.display = "block";
  });
  // 햄버거바-x
  document.querySelector(".fa-times").addEventListener("click", function (e) {
    document.querySelector(".bars").style.display = "none";
  });
  // 햄버거바-depth
  document.querySelector(".depth_sidebar").addEventListener("click", function (e) {
    document.querySelector(".bars").style.display = "none";
  });
}, 1000);
