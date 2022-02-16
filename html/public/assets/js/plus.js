// 지금 비동기 처리가 안되서 시간줘서 처리한거임 나중에 다시 해결
setTimeout(function () {
    let plusBtn=document.querySelector("#post_plus");
    let closeBtn=document.querySelector("#post_plus_close");
    let container=document.querySelector("#post_plus_container");

    //플러스버튼
    plusBtn.addEventListener("click", function (e) {
        container.classList.add("open");
        plusBtn.style.display='none';
    });
  
    closeBtn.addEventListener("click", function (e) {
        container.classList.remove("open");
        plusBtn.style.display='block';
    });

    container.addEventListener("click", function (e) {
        container.classList.remove("open");
        plusBtn.style.display='block';
    });

  }, 1000);
  