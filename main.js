// d3.csv("Weather Data/CLT.csv").then(function(CityCLT, error) {
//     d3.csv("Weather Data/CQT.csv").then(function(CityCQT, error) {
//     })   
    
//     })


let graphData = {
  // nodes: [{id:"hello", group: 1}, {id:"world", group: 2}],
  nodes: [],
  links: []
  // links: [{source:"hello",target:"world",value:10}]
}

let dateInquiring = "2014-7-1"
    
Promise.all([
    d3.csv("Weather Data/KSEA.csv"),
    d3.csv("Weather Data/KNYC.csv"),
    d3.csv("Weather Data/KHOU.csv"),
    d3.csv("Weather Data/CLT.csv"),
    d3.csv("Weather Data/CQT.csv"),
    d3.csv("Weather Data/IND.csv"),
    d3.csv("Weather Data/JAX.csv"),
    d3.csv("Weather Data/MDW.csv"),
    d3.csv("Weather Data/PHL.csv"),
    d3.csv("Weather Data/PHX.csv"),
    d3.csv("Weather Data/cities-gps.csv"),
]).then(function(files) {


    console.log(files)
    //for each City Name ABR in files[10], we add them in to graphData.nodes
    //we also make the group equals to index of the city in files[10]
    //we also make the id equals to the city name
    files[10].forEach(function(city, index){
        graphData.nodes.push({id: city["City Name ABR"], group: index})
        // console.log("hello")
    })
    console.log(graphData)
    //make a for loop from 0 to 9
    let cityData = []
    dataFiles = files.slice(0, 10)
    dataFiles.forEach(function(file, index){
      // console.log(file)
      cityData.push([getDataFromDate(dateInquiring, file).actual_mean_temp, files[10][index]["City Name ABR"]])
    })
    console.log(cityData)
    // get the city names and the tempearture between 25 to 75 percentile
    let q1 = d3.quantile(cityData, 0.25, function(d){return d[0]})
    let q3 = d3.quantile(cityData, 0.75, function(d){return d[0]})
    console.log(q1, q3)

    var filteredData = cityData.filter(function(d) {
      return (d[0] >= q1 && d[0] <= q3);
    });
    var cityNames = filteredData.map(function(d) { return d[1]; });
    var temperatures = filteredData.map(function(d) { return d[0]; });
    console.log(cityNames)
    console.log(temperatures)

    graphData.links.push( DPConnectNode(filteredData))
    // cityNames.forEach(function(city, index){
    //   graphData.nodes.push({id: city, group: index})
    // })
    console.log(graphData)

    // get rid of the undefined in graphData.links
    graphData.links = graphData.links.filter(function(d){return d != undefined})

    let chart = ForceGraph(graphData,{
      nodeId: d => d.id,
      nodeGroup: d => d.group,
      nodeTitle: d => `${d.id}\n${d.group}`,
      linkStrokeWidth: l => Math.sqrt(l.value),
      height: 600,} )
    console.log(chart)
    // put chart in main div
    d3.select("#main").append("div").node().appendChild(chart)
    
  


    // for each flle in files[0-9], we need get the first row of data and but it in a list firstRowData
  

})

// add a slider that changes the dateInquiring
// Set the range of dates for the slider
const minDate = new Date("2014-07-01");
const maxDate = new Date("2015-07-01");

 
 // Create the slider scale and axis
 const xScale = d3.scaleTime()
   .domain([minDate, maxDate])
   .range([0, 500])
   .clamp(true);
 
 const xAxis = d3.axisBottom(xScale)
   .tickFormat(d3.timeFormat("%b %Y"))
   .tickSize(0)
   .tickPadding(12);
 
 // Add the slider to the SVG
 const svg = d3.select("#slider")
   .attr("width", 600)
   .attr("height", 70);
 
 const slider = svg.append("g")
   .attr("class", "slider")
   .attr("transform", "translate(50,30)");
 
 slider.append("line")
   .attr("class", "track")
   .attr("x1", xScale.range()[0])
   .attr("x2", xScale.range()[1])
   .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
   .attr("class", "track-inset")
   .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
   .attr("class", "track-overlay")
   .call(d3.drag()
     .on("start.interrupt", function() { slider.interrupt(); })
     .on("start drag", function() {
       const x = d3.event.x;
       updateDate(d3.timeFormat("%Y-%m-%d")(xScale.invert(x)));
     }));
 
 slider.insert("g", ".track-overlay")
   .attr("class", "ticks")
   .attr("transform", "translate(0,18)")
   .call(xAxis);
 
 const handle = slider.insert("circle", ".track-overlay")
   .attr("class", "handle")
   .attr("r", 9);
 
 // Update the variable date value when the slider is moved
 function updateDate(h) {
   handle.attr("cx", xScale(new Date(h)));
   dateInquiring = h;
   console.log(dateInquiring); // For testing purposes
 }


function getDataFromDate(date, file){
  if(file.length == 0){
    return null
  }
  date = new Date(date)
  let beginDate = new Date("2014-7-1")
  let dateDifference = date - beginDate
  let nextyear = new Date("2015-2-12")
  dateDifference = Math.trunc(dateDifference / 86400000)
  console.log(dateDifference)
  return file[dateDifference]
  
}

function DPConnectNode(filteredData){
  
  //get all combinations of city name in filteredData using flatmap
  let combinations = filteredData.flatMap(function(d, index){
    let rest = filteredData.slice(index + 1)
    return rest.map(function(e){
      // the bigger the difference, the less likely they are connected
      let difference = 1/(Math.abs(d[0] - e[0])+0.2)*2
      return [d[1], e[1], difference]

    })
  })
  console.log(combinations)
  // for each combination, push to graphData.links
  combinations.forEach(function(combination){
    graphData.links.push({source: combination[0], target: combination[1], value: combination[2]})
  })

  // filteredData.sort(function(a, b) {
  //   return a[1].localeCompare(b[1]);
  // });
  
  // // Step 2: Create 2D array to store temperature differences
  // var diffs = [];
  // for (var i = 0; i < filteredData.length; i++) {
  //   var row = [];
  //   for (var j = 0; j < filteredData.length; j++) {
  //     row.push(-1);
  //   }
  //   diffs.push(row);
  // }
  
  // // Step 3: Compute temperature differences and store in 2D array
  // for (var i = 0; i < filteredData.length; i++) {
  //   for (var j = i + 1; j < filteredData.length; j++) {
  //     var diff = Math.abs(filteredData[i][0] - filteredData[j][0]);
  //     diffs[i][j] = diff;
  //   }
  // }
  
  // // Step 4: Create links array of objects based on temperature differences
  // var links = [];
  // for (var i = 0; i < diffs.length; i++) {
  //   for (var j = i; j <diffs.length; j++) {
  //     var diff = diffs[i][j];
  //     if (diff > 0) {
  //       var link = {
  //         source: filteredData[i][1],
  //         target: filteredData[j][1],
  //         value: diff
  //       };
  //       graphData.links.push(link);
  //     }
  //   }
  // }
}
        

// print out the data in main div

//Todo:
// we need nodes and links
// nodes:
//  - id, which is the city
//  - group, which is different color, so each city needs a different group
// links:
//  - we should only have linkes when the cities have an average temperature(we need to get average temperature) within 10 degrees of each other that











  
  
  
  
  
  
  

// ForceGraph()({nodes: [{id:"hello", group: 1}, {id:"world", group: 2}], links: [{source:"hello",target:"world",value:1}]}, {nodeId: d => d.id,
//         nodeGroup: d => d.group,
//         nodeTitle: d => `${d.id}\n${d.group}`,
//         linkStrokeWidth: l => Math.sqrt(l.value),
//         height: 600})






// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/disjoint-force-directed-graph
function ForceGraph({
  nodes, // an iterable of node objects (typically [{id}, …])
  links // an iterable of link objects (typically [{source, target}, …])
}, {
  nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup, // given d in nodes, returns an (ordinal) value for color
  nodeGroups, // an array of ordinal values representing the node groups
  nodeTitle, // given d in nodes, a title string
  nodeFill = "currentColor", // node stroke fill (if not using a group color encoding)
  nodeStroke = "#fff", // node stroke color
  nodeStrokeWidth = 1.5, // node stroke width, in pixels
  nodeStrokeOpacity = 1, // node stroke opacity
  nodeRadius = 5, // node radius, in pixels
  nodeStrength,
  linkSource = ({source}) => source, // given d in links, returns a node identifier string
  linkTarget = ({target}) => target, // given d in links, returns a node identifier string
  linkStroke = "#999", // link stroke color
  linkStrokeOpacity = 0.6, // link stroke opacity
  linkStrokeWidth = 1.5, // given d in links, returns a stroke width in pixels
  linkStrokeLinecap = "round", // link stroke linecap
  linkStrength,
  colors = d3.schemeTableau10, // an array of color strings, for the node groups
  width = 640, // outer width, in pixels
  height = 400, // outer height, in pixels
  invalidation // when this promise resolves, stop the simulation
} = {}) {
  // Compute values.
  const N = d3.map(nodes, nodeId).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const G = nodeGroup == null ? null : d3.map(nodes, nodeGroup).map(intern);
  const W = typeof linkStrokeWidth !== "function" ? null : d3.map(links, linkStrokeWidth);

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
  links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i]}));

  // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = d3.sort(G);

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

  // Construct the forces.
  const forceNode = d3.forceManyBody();
  const forceLink = d3.forceLink(links).id(({index: i}) => N[i]);
  if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
  if (linkStrength !== undefined) forceLink.strength(linkStrength);

  const simulation = d3.forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("x", d3.forceX())
      .force("y", d3.forceY())
      .on("tick", ticked);

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const link = svg.append("g")
      .attr("stroke", linkStroke)
      .attr("stroke-opacity", linkStrokeOpacity)
      .attr("stroke-width", typeof linkStrokeWidth !== "function" ? linkStrokeWidth : null)
      .attr("stroke-linecap", linkStrokeLinecap)
    .selectAll("line")
    .data(links)
    .join("line");

  if (W) link.attr("stroke-width", ({index: i}) => W[i]);

  const node = svg.append("g")
      .attr("fill", nodeFill)
      .attr("stroke", nodeStroke)
      .attr("stroke-opacity", nodeStrokeOpacity)
      .attr("stroke-width", nodeStrokeWidth)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("r", nodeRadius)
      .call(drag(simulation));

  if (G) node.attr("fill", ({index: i}) => color(G[i]));
  if (T) node.append("title").text(({index: i}) => T[i]);

  // Handle invalidation.
  if (invalidation != null) invalidation.then(() => simulation.stop());

  function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }

  function ticked() {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);
  }

  function drag(simulation) {    
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  return Object.assign(svg.node(), {scales: {color}});
}