var margin = 50,
    winHeight = window.innerHeight,
    winWidth = window.innerWidth;

var diameter = Math.min(winHeight, winWidth);

//var color = d3.scale.category10(); // This is a pre-made transfer function, but you can build your own using a list of colors. Functioning example below:
/**
var color = d3.scale.linear() // Returns a linear mapping function
    .domain([0, 5]) // What goes in, [min, max]
    .range(['white','#abc','#dababe', 'rgba(0,0,0,128)']); // What comes out, [min, max] as well, but you can also write a list of colors instead.
*/

var pack = d3.layout.pack()
    //Positioning circles randomly
    .sort(function() { return Math.random()*10; })
    .padding(3)
    .size([diameter - margin, diameter - margin])
    .value(function(d) { return d.size; });

var svg = d3.select("body").append("svg")
    .attr("width", winWidth)
    .attr("height", winHeight)
    .append("g")
    .attr("transform", "translate(" + winWidth / 2 + "," + winHeight / 2 + ")");

d3.json("../data/linkedindata.json", function(error, root) {
  if (error) throw error;

  var focus = root,
      nodes = pack.nodes(root),
      view;

  var circle = svg.selectAll("circle")
      .data(nodes)
    .enter().append("circle")
      //.attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      //.style("fill", function(d) { return d.children ? color(d.depth) : LEAF_COLOR; })
      .attr("class", function(d) {
        var firstClass = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
        if(d.name == "Bork"){
          return firstClass + " kth";
        }
        else if(d.name == "Electrical Engineering"){
          return firstClass + " electrical-engineering";
        }
        else if(d.name == "Computer Science"){
          return firstClass + " computer-science";
        }
        else if (d.name == "Top Skills"){
          return firstClass + " top-skills";
        }
        else if (d.name == "Working at"){
          return firstClass + " working-at";
        }
        else if(d.name == "What are they doing?"){
          return firstClass + " doing";
        }
        else {
          return firstClass + " child";
        }
      })
      .on("click", function(d) {
        if (focus !== d) zoom(d),
          d3.event.stopPropagation();
          removeTreeLevel(root);
          enterTreeLevel(d);
      });

  var text = svg.selectAll("text")
      .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .style("font-weight", function(d) { return d.parent === root ? "bold" : "normal"})
      .text(function(d) { return d.name; });

  var node = svg.selectAll("circle,text");

  d3.select("body")
      .attr("class", "chart-background")
      .on("click", function() {
        zoom(root);
        removeTreeLevel(root);
      });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function enterTreeLevel(d) {
   //loop through all parents and add to history
    while(d.parent){
      var str = d.name;
      str = str.replace(/\s+/g, '-').toLowerCase();
      str = str.replace('?','');
      console.log(str);
      d3.selectAll(".tree")
        .insert("h3",":first-child")
        .attr("class", "tree-box")
        .attr("id", str)
        .style({"display": "block"})
        .text(d.name);
      d = d.parent;
    }
    //add the kth box-title in history
    d3.selectAll(".tree")
      .insert("h3", ":first-child")
      .attr("class", "kth-box")
      .attr("id", "kth-box")
      .text("KTH");
  }

  function removeTreeLevel(d) {
    d3.selectAll(".tree")
      .selectAll("h3")
      .remove();
  }

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition.selectAll("text")
      .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
});

d3.select(self.frameElement).style("height", diameter + "px");
