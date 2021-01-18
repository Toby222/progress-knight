//originally by Pseiko

function changeTab(direction)
{
    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"));
    var tabButtons = Array.prototype.slice.call(document.getElementsByClassName("tabButton"));

    var currentTab = 0;
    for (i in tabs) 
    {
        if (!tabs[i].style.display.includes("none"))
             currentTab = i*1;
    }
    
    var targetTab = (currentTab+direction) % tabs.length;
    
    if(targetTab < 0)
    {
        targetTab = (tabs.length - 1);
    }
    
    //check for tabs not unlocked
    while(tabButtons[targetTab].style.display.includes("none") || tabButtons[targetTab].className.includes("hidden") || tabButtons[targetTab].className.includes("hiddenTask")){
        targetTab = (targetTab+direction) % tabs.length;
        targetTab = Math.max(0,targetTab);
    }
    
    setTab(tabButtons[targetTab], tabs[targetTab].id);
} 

document.onkeydown =  function(e){
    if(e.key==" ") setPause() 
    if(e.key=="ArrowRight") changeTab(1) 
    if(e.key=="ArrowLeft") changeTab(-1) 
}