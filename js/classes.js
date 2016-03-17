"use strict";
/**
 * An object with an attribute for every column in the csv file.
 * @class Alumn
 */
class Alumn {
  /**
   * An object for every row entry in the csv file.
   * @param  {String} country        Country of origin
   * @param  {String} company   What company they work at.
   * @param  {String} profession       Current employment title
   * @param  {String} programme      What programme they studied at KTH
   * @param  {number} graduation     What year they graduated
   * @constructs Alumn
   */
  constructor(country, company, profession, education, graduation) {
    this.Country = country;
    this.Company = company;
    this.Profession = profession;
    this.Education = education;
    this.Graduation = graduation;
  }
}

class Tooltip {
  constructor(accessor) {
    this._tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("pointer-events", "none")
        .style("position", "absolute")
        // .style("opacity", 0)
        ;

    this._tooltip.append("p");

    this.accessor = accessor || ((d) => String(d));

    this.show = (d) =>{
      this._tooltip.transition()
        .duration(400)
        .style("opacity", 1);

      this._tooltip.select('p')
        .text(this.accessor(d));
    }

    this.move = () =>{
      var xpos = d3.event.pageX - (d3.event.pageX < window.width/2 ? 0 : parseInt(getComputedStyle(this._tooltip.node(), "").width));

      this._tooltip
        .style("left", (xpos) + "px")
        .style("top", (d3.event.pageY) + "px");
    }

    this.hide = () =>{
      this._tooltip.transition()
        .duration(400)
        .style("opacity", 0);
    }
  }


}

class Donut {
  constructor(name, data, showAll) {
    var width = screenWidth / 2,
        height = screenHeight / 2,
        radius = Math.min(width, height) / 2,
        donutWidth = radius / 2.5;

    var x = screenWidth / 2 + panAmount * widthFactor,
        y = screenHeight / 2;

    this.tooltip = new Tooltip((d) => d.data.key);
    this.color = (i) => d3.hcl(i * 27, 10 + 40 * Math.sin(i), 40 + (i % 2) * 40).toString();
    this.arc = d3.svg.arc()
    .innerRadius(radius - donutWidth) // NEW
    .outerRadius(radius);
    this.name = name;

    this.pie = d3.layout.pie()
    .value((d)=>d.value)
    .sort(null);
    // .sort((a,b)=>b.value-a.value); //Uncomment to reverse order

    this._data = d3.entries(data).sort((a,b)=>b.value-a.value);


    this.donut = canvas.append('g')
      .attr('width', width)
      .attr('height', height)
      .attr('id', `${name}-donut`)
      .attr('class', 'donut')
      .attr('transform', 'translate(' + (x) + ',' + (y) + ')');
      //on click event where d.data is the label attached to the clicked segment, ex name:ericsson, count:21
     // .on("click", (d) => this.showDetails(d.data));

    this.donut.transition()
      //.ease("exp")
      .duration(1000)
      .attrTween("d", this.tweenPie);

    this.centerText = this.donut.append("text").attr("text-anchor", "middle")
      .classed("donut-center-text", true)
      .classed("bubble-text", true);

     //this.donut.selectAll('path')

     //sets first showAll to false unless other is defined
     if(showAll == undefined || showAll != true){
      this.showAll = false;
     }else{
       this.showAll = showAll;
     }
  }

  get showAll(){
    return this._showAll;
  }

  set showAll(value){
    this._showAll = value;
    if(value){
      this.updateDonut(this._data);
      this.centerText.text("ALL " +this.name.toUpperCase());
    }else{
      this.updateDonut(this._data.slice(0,10));
      this.centerText.text("TOP 10 "+ this.name.toUpperCase());
    }
  }

  updateDonut(data){
    this.donut.selectAll('path').remove();
    this.donut.selectAll('path')
        .data(this.pie(data)) // Show all
        .enter()
        .append('path')
        .attr('d', this.arc)
        .attr('fill', (d, i) => this.color(i))
        .attr("class", "donut-path")
        .on("mouseover", (d) => {
          this.tooltip.show(d);
          this.showDetails(d.data);
        })
        .on("mousemove", this.tooltip.move)
        .on("mouseout", this.tooltip.hide)
        //on click event where d.data is the label attached to the clicked segment, ex name:ericsson, count:21
        //.on("click", (d) => this.showDetails(d.data))
        .transition()
        .duration(1200)
        .attrTween("d", this.tweenPie);

        canvas.selectAll("#donut-toggle , #donut-toggle-text")
        .classed("hidden-section", false)
        .classed("active-section", true);
        canvas.selectAll("#donut-toggle-text")
        .text("Toggle Top/All "+this.name);


  }

  delete() {
  	canvas.selectAll(".donut").remove();
    canvas.selectAll("#donut-details , #donut-details-text, #donut-toggle, #donut-toggle-text")
    .classed("active-section", false)
    .classed("hidden-section", true);
  }
  showDetails(data){

    var display = function(info) {
      d3.selectAll('#text-span').remove();
      var textToPrintIn = info.summary.summary;
      var textToPrint=[];
      if(textToPrintIn){

        var textToPrintSnippets = textToPrintIn.match(/(\S+)|(\S+)(?= *\n|$)|\S+/g);
        //textToPrint = textToPrint.match(/(\S+ \S+ \S+ \S+ \S+ \S+ \S+ \S+ \S+)|(\S+ \S+ \S+ \S+ \S+ \S+ \S+)(?= *\n|$)|\S+/g);

        for(var j=0;j<6;j++){
          var textToPush="";
          for(var k=0;k<10;k++){
            var singleWord = textToPrintSnippets.shift();
            if(typeof singleWord !== 'undefined'){
              textToPush += singleWord+" ";
            }else{
              textToPush+="";
            }
          }
          textToPrint[j]=textToPush;
        }

        d3.selectAll("#donut-details, #donut-details-text")
      		.classed("active-section", true)
      		.classed("hidden-section", false)
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr('dy', 0)
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('id', 'text-span')
          .text(textToPrint[0])
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 15)
          .attr('id', 'text-span')
          .text(textToPrint[1])
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 15)
          .attr('id', 'text-span')
          .text(textToPrint[2])
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 15)
          .attr('id', 'text-span')
          .text(textToPrint[3])
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 15)
          .attr('id', 'text-span')
          .text(textToPrint[4])
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 15)
          .attr('id', 'text-span')
          .text(textToPrint[5]+'...')
          .append("a")
          .attr("text-anchor", "middle")
          .attr("id", "wiki-link")
          .on("click", function(){ d3.select(this).attr("target", "_blank").attr("xlink:href", 'http://en.wikipedia.org/wiki/' + searchWord);})
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 25)
          .attr('id', 'text-span')
          .text('Link to Wikipedia');
      }

      if (!textToPrintIn) {
        textToPrint = data.key;
        d3.selectAll("#donut-details, #donut-details-text")
      		.classed("active-section", true)
      		.classed("hidden-section", false)
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('id', 'text-span')
          .text("Unfortunately we don't have any additional data about "+ data.key +".").append("tspan")
          .append("a")
          .attr("text-anchor", "middle")
          .attr("class", "google-link")
          .on("click", function(){ d3.select(this).attr("target", "_blank").attr("xlink:href", 'http://google.com/#q=' + data.key);})
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2)+ panAmount * widthFactor)
          .attr('dy', 25)
          .attr('id', 'text-span')
          .text("Let me google that for you");
      }

    }

    var searchWord = data.key.replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_");
    d3.selectAll('#text-span').remove();
    d3.selectAll("#donut-details, #donut-details-text")
      .classed("active-section", true)
      .classed("hidden-section", false)
      .append("tspan")
      .attr("text-anchor", "middle")
      .attr("x", (screenWidth / 2) + panAmount * widthFactor)
      .attr('id', 'text-span')
      .text("Unfortunately we don't have any additional data about "+ data.key +".")
      .append("a")
      .attr("text-anchor", "middle")
      .attr("class", "google-link")
      .on("click", function(){ d3.select(this).attr("target", "_blank").attr("xlink:href", 'http://google.com/#q=' + data.key);})
      .append("tspan")
      .attr("text-anchor", "middle")
      .attr("x", (screenWidth / 2) + panAmount * widthFactor)
      .attr('dy', 25)
      .attr('id', 'text-span')
      .text("Let me google that for you");


    WIKIPEDIA.getData("http://en.wikipedia.org/wiki/" + searchWord, display, function(error) {
      // om error så kunde den inte hitta
      if (error){
        d3.selectAll("#donut-details, #donut-details-text")
          .classed("active-section", true)
          .classed("hidden-section", false)
          .attr('id', 'text-span')
          .attr("text-anchor", "middle")
          .text("Sorry, there was an issue getting data for "+data.key+".")
          .append("a")
          .attr("class", "google-link")
          .on("click", function(){ d3.select(this).attr("target", "_blank").attr("xlink:href", 'http://google.com/#q=' + data.key);})
          .append("tspan")
          .attr("text-anchor", "middle")
          .attr("x", (screenWidth / 2) + panAmount * widthFactor)
          .attr('dy', 25)
          .attr('id', 'text-span')
          .text("Let me google that for you");
      }
    });
  }
  tweenPie(b) {

    var width = screenWidth / 2,
        height = screenHeight / 2,
        radius = Math.min(width, height) / 2,
        donutWidth = radius / 2.5;

    var x = screenWidth / 2 + panAmount * widthFactor,
        y = screenHeight / 2;

    var tooltip = new Tooltip((d) => d.data.key);
    var color = (i) => d3.hcl(i * 27, 10 + 40 * Math.sin(i), 40 + (i % 2) * 40).toString();
    var arc = d3.svg.arc()
    .innerRadius(radius - donutWidth) // NEW
    .outerRadius(radius);

    var i = d3.interpolate({startAngle: 1.1*Math.PI, endAngle: 1.1*Math.PI}, b);
    return function(t) { return arc(i(t)); };
  }
}


class SizeManager {
  // height and width are the sizes of the actual content.
  // mainPadding = 15 and navBarHeight = 71
  get height() {return window.innerHeight - 71 - 2*15;}
  get width() {return window.innerWidth - 2*15;}
  //
  get isLandscape() {return this.width > this.height;}
  get longSide() {return this.isLandscape? this.width : this.height;}
  get shortSide() {return this.isLandscape? this.height : this.width;}
  get bigRadius() {return this.shortSide/3}
  get focusRadius() {return this.shortSide/4}
  get previewRadius() {return this.shortSide/10}
  get bubbleRadius() {return this.shortSide/14}

  // Design is designed for 1200x800
  get heightFactor() { return sizes.height / 800;}
  get widthFactor() { return sizes.width / 1200;}

  delta(subdivisions){ return (2 * Math.PI) / subdivisions;}
}


/*showDetails(data){
  var display = function(info) {
    var textToPrint = info.summary.summary;
    if (!textToPrint) {
      textToPrint = data.key;
    }
    d3.selectAll("#donut-details, #donut-details-text")
      .classed("active-section", true)
      .classed("hidden-section", false)
      .text(textToPrint);
  };
  replace(" AB", "")
*/
  /*function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  var tmpSearchSplit = data.key.match(/\S+/g);
  var searchWord="";
  for(var b=0;b<tmpSearchSplit.length;b++){
    if(b>0){
      searchWord += " " +tmpSearchSplit[b].toLowerCase();

    }else{
      searchWord += capitalizeFirstLetter(tmpSearchSplit[b]);
    }
  }*/
  //searchWord = searchWord.replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_").replace(" ", "_");
