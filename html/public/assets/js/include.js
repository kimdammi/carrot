// "data-include" 속성을 갖는 모든 요소에 대한 탐색
Array.from(document.querySelectorAll("*[data-include]")).map(async (v,i)=>{
    const include = v.dataset.include;
    let html = null;
    
    try{
        const response = await axios.get(include);
        html = response.data;
        //console.log(html);
    }catch(e){
        logger.error(e);
    }
    
    if(html!=null){
        v.outerHTML = html;  // outerHTML: 통째로 대체되는 것
    }
});