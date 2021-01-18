function changeTab(direction){
    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    var tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"))

    var currentTab = 0
    for (i in tabs) {
        if (!tabs[i].style.display.includes("none"))
             currentTab = i
    }
    var targetTab = currentTab+direction
    targetTab = Math.max(0,targetTab)
    if( targetTab > (tabs.length-1)) targetTab = 0
    while(tabButtons[targetTab].style.display.includes("none")){
        targetTab = targetTab+direction
        targetTab = Math.max(0,targetTab) 
        if( targetTab > (tabs.length-1)) targetTab = 0
    }
    setTab(document.getElementById(tabs[targetTab].id+"TabButton"), tabs[targetTab].id)
} 

document.onkeydown =  function(e){
    console.log(e.key)
    if(e.key==" ") setPause() 
    if(e.key=="ArrowRight") changeTab(1) 
    if(e.key=="ArrowLeft") changeTab(-1) 
}