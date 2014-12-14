
var data = {
  lines:["Ni mutil guapoa naiz","I am a beautiful boy"],
  arrows:[["Ni","I"],["mutil","boy"],["guapoa","beautiful"],["naiz","am"]]
}

window.onload=function(){
  createLines("#container",data)
};

function createLines(selector, data){

  var canvas = d3.select(selector).append("svg")
      .attr("id","main")
      .style("width",400)
      .style("height",400);

  var color = d3.scale.category20();

  // Respect the css styles
  var lineHeight = parseInt(canvas.style("font-size"))*6;
  var spaceWidth = lineHeight/4;
  var marginLeft = 10;

  canvas.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("refX", 0.1)
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z");

  var words = new Array();

  // Keep these variables to resize the container
  var maxLineWidth = 0;
  var maxLineHeight = 0;
  var lineWidth;

  // For every line, add the words
  for(i=0;i<data.lines.length;i++){

    words[i] = new Object();

    var lineWords = data.lines[i].split(" ");
    var wordWidths = [lineWords.length];
    var wordPositions = [lineWords.length];

    lineWidth = 0;

    canvas.selectAll("word").data(lineWords).enter()
      .append("text")
      .text(function(t) { return t; })
      .attr("class","word")
      .attr("y",function(){return this.getBBox().height+lineHeight*i})
      .attr("",function(t,j){
        wordWidths[j] = this.getBBox().width+spaceWidth;
      })
      .attr("x",function(t,j){
        var widthSum=0;
        // Sum up to the current point
        for(var k=0;k<j;k++){
          widthSum += wordWidths[k];
        }
        wordPositions[j] = widthSum;
        return marginLeft+widthSum;
      })
      .each(function(e,j){
        var word = new Object();
        // TODO Oh no! what if there are duplicated words!
        words[i][e] = this.getBBox();
        lineWidth += this.getBBox().width+spaceWidth;
        maxLineHeight = this.getBBox().height;
      });

    if(lineWidth > maxLineWidth){
      maxLineWidth = lineWidth;
    }
  }

  // For each arrow, find the words and draw the arrows
  for(var i=0;i<data.arrows.length;i++){

    var currentPair = data.arrows[i];
    var wordsInLine = [data.lines.length];

    //TODO make this flexible (for more than 2 lines)
    wordsInLine[0] = words[0][currentPair[0]];
    wordsInLine[1] = words[1][currentPair[1]];

    //console.log("Line ("+wordsInLine[0].x+","+wordsInLine[0].y+")->("+wordsInLine[1].x+","+wordsInLine[1].y+")")

    // TODO these paths are a little ugly
    var lineData = [];
    lineData.push({ "x": wordsInLine[0].x+wordsInLine[0].width/2, "y": wordsInLine[0].y+wordsInLine[0].height });
    lineData.push({ "x": wordsInLine[0].x+wordsInLine[0].width/2, "y": wordsInLine[0].y+wordsInLine[0].height+lineHeight/5 });
    lineData.push({ "x": wordsInLine[1].x+wordsInLine[1].width/2, "y": wordsInLine[1].y-10-lineHeight/5});
    lineData.push({ "x": wordsInLine[1].x+wordsInLine[1].width/2, "y": wordsInLine[1].y-10});

    canvas
      .append("line")
      .attr("x1",wordsInLine[0].x)
      .attr("y1",wordsInLine[0].y+wordsInLine[0].height)
      .attr("x2",wordsInLine[0].x+wordsInLine[0].width)
      .attr("y2",wordsInLine[0].y+wordsInLine[0].height)
      .attr("stroke-width", 4)
      .attr("stroke", color(i));

    canvas
      .append("path")
      .attr("class","line")
      .attr("d", lineFunction(lineData))
      .attr("stroke-width", 2)
      .attr("stroke", color(i))
      .attr("fill", "none")
      .attr("marker-end", "url(#arrowhead)")
      .on("mouseover",function(){
        d3.select(this).transition().duration(100)
        .style("stroke-width", 3);
      })
      .on("mouseout",function(){
        d3.select(this).transition().duration(100)
        .style("stroke-width", 2);
      })

  }

  // Finally, fix the width of the container
  canvas.style("width",maxLineWidth-spaceWidth+marginLeft);
  canvas.style("height",lineHeight+maxLineHeight*2);

}

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var lineFunction = d3.svg.line()
  .x(function(d) { return d.x; })
  .y(function(d) { return d.y; })
  .interpolate("cardinal")
  .tension(0.95);