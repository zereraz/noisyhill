$(document).ready(function(){

    function init(){
        var canvas = document.getElementById('myCanvas');
        var ctx = canvas.getContext('2d');
        ctx.fillStyle="#ffffff";
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
    function Color(color, opacity){
        this.color = color;
        this.opacity = opacity;

    }
    function Point(x, y, color, opacity){
        this.x = x;
        this.y = y;
        this.color = new color(color,opacity);
    }
    function tool(type, options){
        this.type = type;
        this.options = options;
    }
    init();
    
});
