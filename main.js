
graphData = {
  // nodes: [{id:"hello", group: 1}, {id:"world", group: 2}],
   // links: [{source:"hello",target:"world",value:10}]
  nodes: [],
  links: []
}



//initialize the graphData
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

  let dateInquiring = "2014-12-14"
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
    let row = getDataFromDate(dateInquiring, file)
    cityData.push([row.actual_mean_temp, files[10][index]["City Name ABR"],  row.actual_precipitation, ])
  })
  

  graphData.nodes.forEach(function(node){
    // node.temperature = the number in city in cityData where the city name is equal to node.id
    cityData.forEach(function(city){
      if (city[1] == node.id) {
        node.temperature = city[0]
        node.precipitation = city[2]
      }
    })
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

  let meanTemp = d3.mean(cityData, function(d){return d[0]})
  let offsetUnit = window.innerWidth/100
  let relativeTo50 = meanTemp - 50
  let offset = relativeTo50 * offsetUnit
  console.log("meanTemp", meanTemp)
  d3.select("#temp-display").text("Mean temperatue:", meanTemp)
  console.log("offset", offset)

  // draw 10 verticle lines that spans across window.innerwidth and mark each line with the temperature ranging from 0 to 100
  for (i = 0; i <= 10; i++){
    let unit = window.innerWidth/10
    let offsetForLine = i * unit
    addLines(offsetForLine)
  }

  let chart = ForceGraph(graphData,{
    nodeId: d => d.id,
    nodeGroup: d => d.group,
    nodeTitle: d => `${d.id}\n${d.group}`,
    nodeTemp: d => d.temperature,
    nodePrecipitation: d => d.precipitation,
    linkStrokeWidth: l => Math.sqrt(l.value),
    width: window.innerWidth,
    height: 600,
    nodeRadius: 8,
    // nodeStrength: -100
    linkStrength: 0.0001,
  } , 0)
  console.log(chart)
  // insert chart into main div
  d3.select("#graph").remove()
  d3.select("#main").append("div").attr("id", "graph").node().appendChild(chart)



})


function addLines(offset){
  // let offset = 0;
  let position = 0;
  let final = position + offset;

  let svg = d3.select("#main").append("svg")
  .attr("height", 600)
  .attr("width", 2)
  .attr("id", "tempYAxis")
  .style("position", "absolute")
  .style("top", "0px")
  .style("left", final +"px")
  .style("z-index", "-1")
  .style("background-color", "black")
  .style("opacity", "0.5")



  
  
}











// Get the slider and dateInquiring elements
const slider = document.getElementById("myRange");

// Add event listener to the slider
slider.addEventListener("change", function() {
  // Calculate the corresponding date value
  const days = parseInt(this.value);
  const startDate = new Date("2014-07-01");
  const endDate = new Date("2015-06-30");
  const currentDate = new Date(startDate.getTime() + (days * 24 * 60 * 60 * 1000));
  const dateString = currentDate.toISOString().slice(0,10);

  // Update the value of dateInquiring
  let dateInquiring = dateString;
  console.log(dateInquiring)
  renderGraph(dateInquiring)
});

const dateDisplay = document.getElementById("date-display");
slider.addEventListener("input", function() {
  const days = parseInt(this.value);
  const startDate = new Date("2014-07-01");
  const currentDate = new Date(startDate.getTime() + (days * 24 * 60 * 60 * 1000));
  const dateString = currentDate.toDateString();

  // Update the value of dateInquiring and the date display
  
  dateDisplay.innerHTML = dateString;
});




function renderGraph(dateInquiring) {
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
      // find the minimum and maximum temperature in the data
      let minTemp = Infinity
      let maxTemp = -Infinity
      files.forEach(function(file){
        file.forEach(function(data){
          if (data.actual_precipitation < minTemp) {
            minTemp = data.actual_precipitation
          }
          if (data.actual_precipitation > maxTemp) {
            maxTemp = data.actual_precipitation
          }
        })
      })
      console.log("min, max", minTemp, maxTemp)



      graphDataClear()
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
        let row = getDataFromDate(dateInquiring, file)
        cityData.push([row.actual_mean_temp, files[10][index]["City Name ABR"],  row.actual_precipitation, ])
      })
      

      graphData.nodes.forEach(function(node){
        // node.temperature = the number in city in cityData where the city name is equal to node.id
        cityData.forEach(function(city){
          if (city[1] == node.id) {
            node.temperature = city[0]
            node.precipitation = city[2]
          }
        })
      })

      console.log("citydata", cityData)

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
      console.log(graphData)

      // get rid of the undefined in graphData.links
      graphData.links = graphData.links.filter(function(d){return d != undefined})

      let meanTemp = d3.mean(cityData, function(d){return d[0]})
      let offsetUnit = window.innerWidth/100
      let relativeTo50 = meanTemp - 50
      let offset = relativeTo50 * offsetUnit
      console.log("meanTemp", meanTemp)
      d3.select("#temp-display").text("Mean temperatue: " +meanTemp + " °F" )
      console.log("offset", offset)

      let chart = ForceGraph(graphData,{
        nodeId: d => d.id,
        nodeGroup: d => d.group,
        nodeTitle: d => `${d.id}\n${d.group}`,
        nodeTemp: d => d.temperature,
        nodePrecipitation: d => d.precipitation,
        linkStrokeWidth: l => Math.sqrt(l.value),
        width: window.innerWidth,
        height: 600,
        nodeRadius: 8,
        // nodeStrength: -100
        linkStrength: 0.0001,
      } , 0)
      console.log(chart)
      // insert chart into main div
      d3.select("#graph").remove()
      d3.select("#main").append("div").attr("id", "graph").node().appendChild(chart)


  })
}
function graphDataClear(){
  graphData = {
    // nodes: [{id:"hello", group: 1}, {id:"world", group: 2}],
    nodes: [],
    links: []
    // links: [{source:"hello",target:"world",value:10}]
  }
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
      let difference = 1/(Math.abs(d[0] - e[0])+0.2)*5
      return [d[1], e[1], difference]

    })
  })
  console.log(combinations)
  // for each combination, push to graphData.links
  combinations.forEach(function(combination){
    graphData.links.push({source: combination[0], target: combination[1], value: combination[2]})
  })


}
        

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
  nodeTemp = d => d.tempearture, // given d in nodes, a temperature string
  nodePrecipitation = d => d.precipitation, // given d in nodes, a precipitation string
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
}, offset = {}) {
  // Compute values.
  console.log("nodeTemp", nodeTemp)
  const N = d3.map(nodes, nodeId).map(intern);
  const Temp = d3.map(nodes, nodeTemp).map(intern);
  const Precipitation = d3.map(nodes, nodePrecipitation).map(intern);
  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  if (nodeTitle === undefined) nodeTitle = (_, i) => N[i];
  const T = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  if (nodeTemp === undefined) nodeTemp = (_, i) => Temp[i];
  const TEMP = nodeTemp == null ? null : d3.map(nodes, nodeTemp);
  if (nodePrecipitation === undefined) nodePrecipitation = (_, i) => Precipitation[i];
  const PRECIPITATION = nodePrecipitation == null ? null : d3.map(nodes, nodePrecipitation);
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

  const forceX = d3.forceX().x(d => {
    const temp = TEMP[d.index];
    console.log("temp", TEMP)
    const scale = d3.scaleLinear().domain([1, 99]).range([-width/2+10, width/2-10]);
    return scale(temp);
  });

  
  const forceY = d3.forceY().y(d => {
    const precip = PRECIPITATION[d.index];
    console.log("precip", precip)
    console.log(height)
    const scale = d3.scaleLinear().domain([0, 4.5]).range([-height/3, height/2]);
    return scale(precip);
  });
  

  const simulation = d3.forceSimulation(nodes)
      .force("link", forceLink)
      .force("charge", forceNode)
      .force("x", forceX)
      .force("y", forceY)
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
  if (T) node.append("title").text(({index: i}) => `${T[i]}\nTemperature: ${TEMP[i]}\nPrecipitation: ${PRECIPITATION[i]}` );
  // nPrecipitation: ${PRECIPITATION[i]}
  console.log("T",  T)
  
  // if (T) {
  //   node.append("title").text((d, i) => {
  //     const temperature = nodes[i].temperature; // get temperature value
  //     return `${T[i]}\nTemperature: ${temperature}`; // add temperature to the tooltip
  //   });
  // }

  // Handle invalidation.
  if (invalidation != null) invalidation.then(() => simulation.stop());

  function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }
  function ticked() {
    link
      .attr("x1", d => d.source.x +offset)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x+offset)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x+offset)
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