(function(root){
function grid(w,h,cols,rows){return {xs:Array.from({length:cols+1},(_,i)=>Math.round(i*w/cols)),ys:Array.from({length:rows+1},(_,i)=>Math.round(i*h/rows))}}
function rects(xs,ys){return ys.slice(0,-1).flatMap((y,r)=>xs.slice(0,-1).map((x,c)=>({x,y,w:xs[c+1]-x,h:ys[r+1]-y})))}
function crop(source,rect,pad,color,create){const c=create();c.width=rect.w+2*pad;c.height=rect.h+2*pad;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=false;ctx.drawImage(source,rect.x,rect.y,rect.w,rect.h,pad,pad,rect.w,rect.h);return c}
const api={grid,rects,crop};if(typeof module!=='undefined')module.exports=api;else root.StampCore=api;
})(globalThis);
