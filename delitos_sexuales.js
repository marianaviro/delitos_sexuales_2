var div = document.getElementsByClassName('graph');

var width = div[0].offsetWidth;
    height = div[0].offsetHeight;
    outerRadius = height * 0.5,
    innerRadius = height * 0.2;

var angle = d3.time.scale()
    .range([0, 2 * Math.PI]);

var radius = d3.scale.linear()
    .range([innerRadius, outerRadius]);

var z = d3.scale.category10();

console.log(z);

var stack = d3.layout.stack()
    .offset("zero")
    .values(function(d) { return d.values; })
    .x(function(d) { return d.dia; })
    .y(function(d) { return d.total; });

var nest = d3.nest()
    .key(function(d) { return d.sexo; });

var line = d3.svg.line.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.dia); })
    .radius(function(d) { return radius(d.y0 + d.y); });

var area = d3.svg.area.radial()
    .interpolate("cardinal-closed")
    .angle(function(d) { return angle(d.dia); })
    .innerRadius(function(d) { return radius(d.y0); })
    .outerRadius(function(d) { return radius(d.y0 + d.y); });

var svg = d3.select(".graph").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

d3.csv("./data/delitossexuales.csv", type, function(error, data) {
  if (error) throw error;

  let nestedByDayAndSex = d3.nest()
  .key(d => d.dia)
  .key(d => d.sexo)
  .entries(data);

  const flatten = nestedByDayAndSex.reduce((acc, d) => {
    return acc.concat(d.values.map(s => {
      return {
        dia: +d.key,
        sexo: s.key,
        total: s.values.length
      }
    }));
  }, []);

  let layers = stack(nest.entries(flatten));

  // Extend the domain slightly to match the range of [0, 2π].
  angle.domain([0, d3.max(flatten, function(d) { return d.dia + 1; })]);
  radius.domain([0, d3.max(flatten, function(d) { return d.y0 + d.y; })]);

  svg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d.values); })
      .style("fill", function(d, i) { return z(i); });

  svg.selectAll(".axis")
      .data(d3.range(angle.domain()[1]))
    .enter().append("g")
      .attr("class", "axis")
      .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
    .call(d3.svg.axis()
      .scale(radius.copy().range([-innerRadius, -outerRadius]))
      .orient("left"))
    .append("text")
      .attr("y", -innerRadius + 6)
      .attr("dy", ".71em")
      .attr("text-anchor", "middle")
      .text(function(d) {
        return dayNameIndex(d);
      });

      var legend = svg.selectAll(".legend")
      .data(z.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(-700," + i * 20 + ")"; });
      legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", z);
      legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return sexIndex(d); });
});

function type(d) {
  d.value = +d.value;
  d.dia = +dayIndex(d.dia);
  return d;
}

function dayIndex(day) {
  switch (day) {
    case "DOMINGO":
        return 0;
    case "LUNES":
        return 1;
    case "MARTES":
        return 2;
    case "MIERCOLES":
        return 3;
    case "JUEVES":
        return 4;
    case "VIERNES":
        return 5;
    case "SABADO":
        return 6;
  }
}

function dayNameIndex(day) {
  switch (day) {
    case 0:
        return "Sun";
    case 1:
        return "Mon";
    case 2:
        return "Tue";
    case 3:
        return "Wed";
    case 4:
        return "Thu";
    case 5:
        return "Fri";
    case 6:
        return "Sat";
  }
}

function sexIndex(sex) {
  switch (sex) {
    case 0:
        return "Women";
    case 1:
        return "Men";
    case 2:
        return "Not specified";
  }
}
