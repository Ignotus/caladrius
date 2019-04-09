
// layout variables
var margins = { 'top': 50, 'right': 50, 'bottom': 50, 'left': 50 };
var innerMargins = { 'top': 10, 'right': 10, 'bottom': 10, 'left': 10 };
var padding = 30;

var cache = {};

var width = (window.innerWidth - padding) - (margins.left + margins.right);
var height = (window.innerHeight - padding) - (margins.top + margins.bottom);

width = d3.min([width, height]);
height = width;

var mymap;

var xlines = [
    { 'x1': 0.3, 'y1': 0.0, 'x2': 0.3, 'y2': 1.0 },
    { 'x1': 0.7, 'y1': 0.0, 'x2': 0.7, 'y2': 1.0 }
];

var ylines = [
    { 'x1': 0.0, 'y1': 0.3, 'x2': 1.0, 'y2': 0.3 },
    { 'x1': 0.0, 'y1': 0.7, 'x2': 1.0, 'y2': 0.7 }
];


// data paths
var dataset_path = '../../data/Sint-Maarten-2017';

var split = 'test';
var split_path = dataset_path + '/' + split;

var run_name = '1552303580';
var csv_filename = run_name + '_epoch_001_predictions.txt';
var csv_path = split_path + '/' + csv_filename;

load_csv_data(csv_path);

function initialized(){

// initialize all the elements for later.

  d3.select('body').select('.scatterPlotContainer').append('svg')
    .attr('class', 'svgContainer')
    .attr('width', Math.round(width + margins.left + margins.right))
    .attr('height', Math.round(height + margins.top + margins.bottom))
  .append('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

  d3.select('body').select('.ImageOneContainer').append('svg')
    .attr('class', 'imageContainer1')
    .attr('width', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width)
    .attr('height', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width)
    .append('g')
      .attr('transform', 'translate(' + innerMargins.left + ',' + innerMargins.top + ')')
         .append('defs')
         .append('pattern')
         .attr('id', 'previewImageID1')
         .attr('width', 1)
         .attr('height', 1)
         .attr('viewBox', '0 0 100 100')
         .attr('preserveAspectRatio', 'true')
          .append('image')
           .attr('width', 100)
           .attr('height', 100)
           .attr('preserveAspectRatio', 'true')
           .attr('xlink:href', 'images/510-logo.png')

     d3.select('body').select('.imageContainer1').select('g')
      .append('rect')
      .attr('class', 'previewImage')
       .attr('fill', function(d){
         return 'url(#' + 'previewImageID1' + ')'})
     .attr('width', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width - (innerMargins.left + innerMargins.bottom))
     .attr('height', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width - (innerMargins.top + innerMargins.bottom))
     .attr('stroke', 'black')
     .attr('stroke-width', 2)

   d3.select('body').select('.ImageTwoContainer').append('svg')
     .attr('class', 'imageContainer2')
     .attr('width', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width)
     .attr('height', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width)
     .append('g')
       .attr('transform', 'translate(' + innerMargins.left + ',' + innerMargins.top + ')')
          .append('defs')
          .append('pattern')
          .attr('id', 'previewImageID2')
          .attr('width', 1)
          .attr('height', 1)
          .attr('viewBox', '0 0 100 100')
          .attr('preserveAspectRatio', 'true')
           .append('image')
            .attr('width', 100)
            .attr('height', 100)
            .attr('preserveAspectRatio', 'true')
            .attr('xlink:href', 'images/510-logo.png')

      d3.select('body').select('.imageContainer2').select('g')
       .append('rect')
       .attr('class', 'previewImage')
        .attr('fill', function(d){
          return 'url(#' + 'previewImageID2' + ')'})
        .attr('width', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width - (innerMargins.left + innerMargins.bottom))
        .attr('height', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width - (innerMargins.top + innerMargins.bottom))
      .attr('stroke', 'black')
      .attr('stroke-width', 2)

    d3.select('body').select('.MapContainer').append('div')
      .attr('id', 'mapid')
      .style('height', '300px');

    mymap = L.map('mapid', {
        'renderer': L.svg({ 'interactive': true })
    }).setView([18.02607520212528, -63.051253259181976], 14);

    d3.select('body').select('.TableContainer').append('table')
      .attr('class', 'infoBox table table-bordered')
      .append('thead')
      .attr('class', 'thead-light')

    d3.select('body').select('.TableContainer').select('table')
      .append('tbody')
        .append('tr').attr('class', 'count')
          .append('th')
          .style('text-align', 'center')
          .text('Count: ');

    d3.select('body').select('.TableContainer').select('table')
      .select('tbody')
        .append('tr').attr('class', 'average')
            .append('th')
            .style('text-align', 'center')
            .text('Average ');

// tooltip infobox

    d3.select('body').select('.InfoContainer').append('table')
      .attr('class', 'infoTooltipBox table table-bordered')
      .append('thead')
      .attr('class', 'thead-light')
      .selectAll('th')
      .data(['Damage', 'Prediction', 'Label'])
      .enter()
      .append('th')
        .attr('scope', 'col')
        .style('text-align', 'center')
        .text(function (d) { return d; });

    d3.select('body').select('.InfoContainer').select('table')
      .append('tbody').append('tr').attr('class', 'info')
      .selectAll('td')
      .data([0 , 0 , 0])
      .enter()
        .append('td')
        .style('text-align', 'center')
        .text(function (d) { return d; });


    // just implement this >.> https://bl.ocks.org/d3indepth/fabe4d1adbf658c0b73c74d3ea36d465
  var xband = d3.scaleBand()
      .domain([0, 1])
      .range([0, width])

  var yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0])
  var svgContainer = d3.select('body').select('.svgContainer').select('g')

  svgContainer.append('g')
      .attr('class', 'x_axis')
      .attr('transform', 'translate(0,' + (height) + ')')
      .call(d3.axisBottom(xband))

  svgContainer.append('g')
      .attr('class', 'y_axis')
      .attr('transform', 'translate(0, 0)')
      .call(d3.axisLeft(yScale).ticks(10, 's'))

  svgContainer.append('div')
    .attr('class', 'hidden')
    .attr('id', 'tooltip')

  svgContainer.selectAll('.xLinedrag')
    .data(xlines)
    .enter()
    .append('line')
    .attr('class', function(d, n){
      return 'xLinedrag line_' + String(n)
    })
  svgContainer.selectAll('.yLinedrag')
    .data(ylines)
    .enter()
    .append('line')
    .attr('class', function(d, n){
      return 'yLinedrag line_' + String(n)
    })

  svgContainer.selectAll('.dot')
      .data(cache.data)
      .enter()
      .append('circle')
      .attr('r', 7)
      .attr('class', 'dot')
      .attr('id', function(d) { return 'dot' + d.feature.properties.OBJECTID})
      .attr('opacity', 0.7)
      .on('mouseover', function(d) {
          d3.select(this).style('cursor', 'pointer')
          d3.select(this).attr('fill', 'red')
          d3.select(this).raise()
        })
      .on('mouseout', function(d) {
        d3.select(this).attr('fill', function(d){
            var inverseXScale = d3.scaleLinear().domain([0, width]).range([0,1])
                if (inverseXScale(d3.select(this).attr('cx')) < xlines[0].x1){
                  d.category = 0
                  return 'orange'
                } else if (inverseXScale(d3.select(this).attr('cx')) > xlines[1].x1) {
                  d.category = 2
                  return 'steelBlue'
                }
                else {
                  d.category = 1
                  return 'purple'
                }
              })
      })
      .on('click', function(d) {
        console.log(d.feature.geometry.coordinates[0][0][0])
        mymap.flyTo([d.feature.geometry.coordinates[0][0][0][1], d.feature.geometry.coordinates[0][0][0][0]], 17);
        d3.selectAll('.selectedDot').attr('class', 'dot')
        d3.selectAll('.selectedPolygon').attr('class', 'myPolygons')
        d3.select(this).attr('class', 'dot selectedDot')

        d3.select('#polygon' + d.feature.properties.OBJECTID).attr('class', 'myPolygons selectedPolygon')
        // console.log('#polygon' + d.feature.properties.OBJECTID)

        d3.select('body').select('.imageContainer1').select('g').select('#previewImageID1').select('image')
          .attr('xlink:href', split_path + '/before/' + d.filename);

        d3.select('body').select('.imageContainer2').select('g').select('#previewImageID2').select('image')
          .attr('xlink:href', split_path + '/after/' + d.filename);

        d3.select('body').select('.infoTooltipBox')
          .select('tbody').select('tr')
          .selectAll('td').remove();

        d3.select('body').select('.infoTooltipBox')
          .select('tbody').select('tr')
          .selectAll('td')
          .data([d.feature.properties._damage, d.prediction.toString().slice(0,4), d.label.toString().slice(0,4)])
          .enter()
            .append('td')
            .style('text-align', 'center')
            .text(function (d) { return d; });
        })

  svgContainer.append('text')
      .text('Siamese network model')
      .attr('transform',
            'translate(' + (width/2) + ' ,' +
                           (-margins.top/2) + ')')
      .style('text-anchor', 'middle')
      .attr('id', 'title_thing')

  svgContainer.append('text')
      .attr('id', 'xAxisLabel')
      .attr('transform',
            'translate(' + (width/2) + ' ,' +
                           (height + margins.top) + ')')
      .style('text-anchor', 'middle')
      .text('Predicted');


  svgContainer.append('text')
      .attr('id', 'yAxisLabel')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margins.left)
      .attr('x',0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Actual');

  redraw();
  mapMaker(cache.data, mymap, split_path);
}
// from https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
window.onkeydown = checkKey;
window.addEventListener('resize', redraw);

function redraw(){
  // console.log(mymap)
  width = (window.innerWidth - 30) - margins.left - margins.right
  height = (window.innerHeight - 30) - margins.top - margins.bottom;

  width = d3.min([width, height])
  height = width
  // margins.left = ((window.innerWidth - 30) - margins.left - margins.right) - width
  // console.log(cache.data)

  var xValue = function(d) { return d.prediction;}, // data -> value
      xScale = d3.scaleLinear().range([0, width]).domain([0,1]), // value -> display
      xMap = function(d) { return xScale(xValue(d));},
      inverseXScale = d3.scaleLinear().domain([0, width]).range([0,1])
  // setup y
  var yValue = function(d) { return d.label}, // data -> value
      yScale = d3.scaleLinear().range([height, 0]).domain([0,1]), // value -> display
      yMap = function(d) { return yScale(yValue(d));}

// RESCALE EVERYTHING //
console.log('hello', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().height)
console.log(d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect())
console.log(d3.select('body').select('.ImageOneContainer').node())

  var svgContainer = d3.select('body').select('.svgContainer')
    .attr('class', 'svgContainer')
    .attr('width', Math.round(width + margins.left + margins.right))
    .attr('height', Math.round(height + margins.top + margins.bottom))
  .select('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

    svgContainer.select('#xAxisLabel')
        .attr('transform',
              'translate(' + (width/2) + ' ,' +
                             (height + margins.top) + ')')

    svgContainer.select('#yAxisLabel')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margins.left)
        .attr('x',0 - (height / 2))
        .attr('dy', '1em')

    svgContainer.select('#title_thing')
        .text('Siamese network model')
        .attr('transform',
              'translate(' + (width/2) + ' ,' +
                             (-margins.top/2) + ')')
        .style('text-anchor', 'middle')

  d3.select('body').select('.imageContainer1')
    .attr('width', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width)
    .attr('height', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width)
    .select('g').select('rect')
      .attr('width', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width - innerMargins.left*2)
      .attr('height', d3.select('body').select('.ImageOneContainer').node().getBoundingClientRect().width - innerMargins.left*2)

  d3.select('body').select('.imageContainer2')
    .attr('width', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width)
    .attr('height', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width)
    .select('g').select('rect')
      .attr('width', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width - innerMargins.left*2)
      .attr('height', d3.select('body').select('.ImageTwoContainer').node().getBoundingClientRect().width - innerMargins.left*2)

  // d3.select('body').select('#mapWidgetContainer')

  var colorScheme = ['black', 'orange', 'purple', 'steelBlue']

  d3.select('body').select('.TableContainer').select('.infoBox')
      .select('thead')
      .selectAll('th')
      .data(['Damage:', 'Least', 'Partial', 'Heavy'])
      .enter()
      .append('th')
        .style('text-align', 'center')
        .text(function (d) { return d; })
        .style('color', function(d, i){ return colorScheme[i]});
    // create a row for each object in the data

d3.select('body').select('.TableContainer').select('table')
  .select('tbody').selectAll('td').remove()

d3.select('body').select('.TableContainer').select('.infoBox').select('tbody')
    .select('.count')
    .selectAll('td')
    .data([categoryCounter(cache.data, 0), categoryCounter(cache.data, 1), categoryCounter(cache.data, 2)])
    .enter()
      .append('td')
      .style('text-align', 'center')
      .text(function (d) { return d; });

d3.select('body').select('.TableContainer').select('.infoBox').select('tbody')
    .select('.average')
    .selectAll('td')
    .data([categoryAverager(cache.data, 0), categoryAverager(cache.data, 1), categoryAverager(cache.data, 2)])
    .enter()
      .append('td')
      .style('text-align', 'center')
      .text(function (d) { return d; });

// RESCALE OF SVG DONE //

  svgContainer.select('.x_axis')
      .attr('transform', 'translate(0,' + (height) + ')')
      .call(d3.axisBottom(xScale))

  svgContainer.select('.y_axis')
      .attr('transform', 'translate(0 , 0)')
      .call(d3.axisLeft(yScale).ticks(10, 's'))

  svgContainer.selectAll('.dot')
      .attr('cx', xMap)
      .attr('cy', yMap)
      .attr('fill', function(d){
        if (inverseXScale(d3.select(this).attr('cx')) < xlines[0].x1){
          d.category = 0
          return 'orange'
        } else if (inverseXScale(d3.select(this).attr('cx')) > xlines[1].x1) {
          d.category = 2
          return 'steelBlue'
        }
        else {
          d.category = 1
          return 'purple'
        }
      })



  svgContainer.selectAll('.xLinedrag')
    .attr('x1', function(d, n){
      return xScale(d.x1)
    })
    .attr('y1', function(d){
      return yScale(d.y1)
    })
    .attr('x2', function(d, n){
      return xScale(d.x2)
    })
    .attr('y2', function(d){
      return yScale(d.y2)
    })
    .style('stroke', function(d, n){
      // console.log(d3.select(this).attr('class').match('line_0'))
      if (d3.select(this).attr('class').match('line_0')){
        return 'orange'
      } else {
        return 'steelBlue'
      }
    })
    .style('stroke-width', 5)
    .call(d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended))
    .on('mouseover', function(d) {
        d3.select(this).style('cursor', 'pointer');
      },
      'mouseout', function(d) {
        d3.select(this).style('cursor', 'default');
      });

    svgContainer.selectAll('.yLinedrag')
      .attr('x1', function(d, n){
        return xScale(d.x1)
      })
      .attr('y1', function(d){
        return yScale(d.y1)
      })
      .attr('x2', function(d, n){
        return xScale(d.x2)
      })
      .attr('y2', function(d){
        return yScale(d.y2)
      })
      .style('stroke', function(d, n){
        // console.log(d3.select(this).attr('class').match('line_0'))
        if (d3.select(this).attr('class').match('line_0')){
          return 'orange'
        } else {
          return 'steelBlue'
        }
      })
      .style('stroke-width', 5)

      updateMap(mymap)
}



function checkKey(e) {
// from https://stackoverflow.com/questions/5597060/detecting-arrow-key-presses-in-javascript
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
      redraw()
    }
    else if (e.keyCode == '40') {
        // down arrow
      redraw()
    }
    else if (e.keyCode == '37') {
      redraw()
       // left arrow
    }
    else if (e.keyCode == '39') {
      redraw()
       // right arrow
    }
}

function dragstarted(d) {
    d3.select(this).raise().classed('active', true);
}

function dragged(d) {
    xScale = d3.scaleLinear()
                .range([0, width])
                .domain([0,1]);

    inverseXScale = d3.scaleLinear()
                        .domain([0, width])
                        .range([0,1]);

    n = Number(d3.select(this).attr('class').split(' ')[1].replace('line_', ''));

    if(n === 0 && (xlines[1].x1 - inverseXScale(d3.event.x)) < 0) {
        xlines[n].x1 = xlines[1].x1;
        xlines[n].x2 = xlines[1].x2;
    } else if(n === 1 && (inverseXScale(d3.event.x) - xlines[0].x1) < 0) {
        xlines[n].x1 = xlines[1].x1;
        xlines[n].x2 = xlines[1].x2;
    } else if(inverseXScale(d3.event.x) > 1) {
        xlines[n].x1 = 1;
        xlines[n].x2 = 1;
    } else if(inverseXScale(d3.event.x) < 0) {
        xlines[n].x1 = 0;
        xlines[n].x2 = 0;
    } else {
        xlines[n].x1 = inverseXScale(d3.event.x);
        xlines[n].x2 = inverseXScale(d3.event.x);
    }
    redraw();
}

function dragended(d) {
    d3.select(this).classed('active', false);
}

function getFeature(gdata, objectId) {
    var feature = null;
    for(var featureIndex in gdata.features) {
        currentFeature = gdata.features[featureIndex];
        if(currentFeature.properties.OBJECTID == objectId) {
            var newObject = jQuery.extend(true, {}, currentFeature);
            var oldCoordinates = newObject.geometry.coordinates[0][0];
            var newGeometry = {
                'coordinates': [[[]]]
            }
            for(coordinateIndex in oldCoordinates) {
                newGeometry.coordinates[0][0].push(convertCoordinate(oldCoordinates[coordinateIndex]));
            }
            newObject.geometry = newGeometry;
            feature = newObject;
            break;
        }
    }
    return feature;
}

function load_csv_data(csv_path){
    geoData = dataset_path + '/' + 'coordinates.geojson'

    d3.json(geoData).then(function(gdata) {
        d3.dsv(' ', csv_path).then(function(data) {
            data.forEach(function(d, i) {
                d.objectId = parseInt(d.filename.replace('.png', ''));
                d.label = parseFloat(d.label);
                d.prediction = parseFloat(d.prediction);
                d.category = categorizer(d.prediction);

                // feature mapping
                d.feature = getFeature(gdata, d.objectId);
                if (d.feature) {
                    d.feature.properties._damage = getFromGeo(d.objectId, gdata);
                }
            });
            data = data.filter(function (d, i) {
                return d.feature != null;
            });
            data.pop();
            cache.data = data;
            initialized();
        });
    });
}

function categorizer(prediction) {
    var lowerBound = 0.3;
    var upperBound = 0.7;

    if(prediction < lowerBound) {
        return 0;
    } else if(prediction > upperBound) {
        return 2;
    } else {
        return 1;
    }
}

function categoryCounter(data, index) {
    return data.filter(datapoint => datapoint.category == index).length;
}

function reducer(accumulator, currentValue) {
    return accumulator + currentValue;
}

function categoryAverager(data, index) {
    var filterCriteria = function(datapoint) {
        return datapoint.category == index;
    };

    length = data.filter(filterCriteria).length;

    var categoryAverage = '0.0000';

    if(length) {
        summation = data.filter(filterCriteria).map(function(x) {
            return Number(x.prediction);
        }).reduce(reducer);

        avg = summation/length;
        categoryAverage = avg.toString().slice(0,5);
    }

    return categoryAverage;
}

function getFromGeo(number, geo) {
    for (i in geo.features) {
        if(geo.features[i].properties.OBJECTID === number) {
            return geo.features[i].properties._damage;
        }
    }
    return 'ERROR';
}

function convertCoordinate(coordinates) {
    var sourceProjection = '+proj=utm +zone=20 +datum=WGS84 +units=m +no_defs';
    var targetProjection = '+proj=longlat +datum=WGS84 +no_defs';
    return proj4(sourceProjection, targetProjection, coordinates);
}

function mapMaker(cacheData, mymap, split_path) {
    mymap.on('moveend', function () {
        updateMap(mymap);
    });

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        'maxZoom': 17,
        'id': 'mapbox.streets',
        'accessToken': 'pk.eyJ1Ijoib3Jhbmd1aCIsImEiOiJjanNxNWthYjgxMHo0NDRyMjc5MnM1c2VwIn0.oydc_gZ6NRz7H_ny4yp0Fw'
    }).addTo(mymap);

    L.control.layers({}, {
        'temp': openWeatherMapo(mymap, "temp_new"),
        'wind': openWeatherMapo(mymap, "clouds_new"),
        'rains': openWeatherMapo(mymap, "precipitation_new"),
        'clouds': openWeatherMapo(mymap, "clouds_new"),
        'heat map labels': heatMapMaker(mymap, cacheData, "label"),
        'heat map prediction': heatMapMaker(mymap, cacheData, "prediction"),
        'heat map category': heatMapMaker(mymap, cacheData, "category")
    }).addTo(mymap)

    mymap.addControl(new L.Control.FullScreen());

    L.svg({ 'interactive': true }).addTo(mymap);

    d3.select('#mapid')
        .select('svg')
            .attr('pointer-events', 'auto')
        .select('g')
        .selectAll('.myPolygons')
        .data(cacheData)
        .enter()
        .append('polygon')
        .attr('class', 'myPolygons')
        .attr('id', function(d) {
            return 'polygon' + d.feature.properties.OBJECTID;
        });

    d3.select('#mapid')
        .select('svg').select('g')
        .selectAll('.myPolygons')
        .attr('opacity', '0.5')
        .style('fill', function(d) {
            if(d.category === 0) {
                return 'orange';
            } else if(d.category === 2) {
                return 'steelBlue';
            } else {
              return 'purple';
            }
        })
        .on('click', function(d) {
            d3.selectAll('.selectedDot')
                .attr('class', 'dot');

            d3.selectAll('.selectedPolygon')
                .attr('class', 'myPolygons');

            d3.select(this)
                .attr('class', 'myPolygons selectedPolygon');

            d3.select('#dot' + d.feature.properties.OBJECTID)
                .attr('class', 'myPolygons selectedPolygon');

            d3.select('body')
                .select('.imageContainer1').select('g')
                .select('#previewImageID1').select('image')
                    .attr('xlink:href', split_path + '/before/' + d.filename);

            d3.select('body')
                .select('.imageContainer2').select('g')
                .select('#previewImageID2').select('image')
                    .attr('xlink:href', split_path + '/after/' + d.filename);

            d3.select('body')
                .select('.infoTooltipBox')
                .select('tbody').select('tr')
                .selectAll('td').remove();

            d3.select('body')
                .select('.infoTooltipBox')
                .select('tbody').select('tr')
                .selectAll('td')
                .data([d.filename, d.prediction.toString().slice(0,4), d.label.toString().slice(0,4)])
                .enter()
                    .append('td')
                        .style('text-align', 'center')
                        .text(function (d) { return d; });

            updateMap(mymap);
        })
        .on('mouseover', function(d) {
            d3.select(this).style('cursor', 'pointer');
        })
        .attr('points', function(d) {
            var coords = d.feature.geometry.coordinates[0][0].map(i => mymap.latLngToLayerPoint([i[1], i[0]]));
            return coords.map(i => i.x + ',' + i.y).join(' ')
        });
}

function updateMap(mymap) {
    d3.select('#mapid')
        .select('svg').select('g')
        .selectAll('.myPolygons')
            .style('fill', function(d) {
                if(d3.select(this).attr('class').includes('selectedPolygon')) {
                    return 'red';
                } else if (d.category === 0) {
                    return 'orange';
                } else if (d.category === 2) {
                    return 'steelBlue';
                } else {
                    return 'purple';
                }
            })
            .attr('points', function(d) {
                var coords = d.feature.geometry.coordinates[0][0].map(i => mymap.latLngToLayerPoint([i[1], i[0]]));
                return coords.map(i => i.x + ',' + i.y).join(' ');
            });
}

function openWeatherMapo(mymap, layer) {
  return L.tileLayer('https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}', {
   layer: layer,
   maxZoom:17,
   api_key: '2733c9a9c041a4ba7ce1963ae1a97dd4'
   })
}

function heatMapMaker(mymap, cacheData, mode) {
  // console.log(cacheData[0])

  if (mode === "label") {
    var heatCoordinates = cacheData.map(
        x => [
            x.feature.geometry.coordinates[0][0][0][1],
            x.feature.geometry.coordinates[0][0][0][0],
            x.label
        ]
    )
  } else if (mode === "prediction") {
    var heatCoordinates = cacheData.map(
        x => [
            x.feature.geometry.coordinates[0][0][0][1],
            x.feature.geometry.coordinates[0][0][0][0],
            x.prediction
        ]
    )
  } else if (mode === "category") {
    var heatCoordinates = cacheData.map(
        x => [
            x.feature.geometry.coordinates[0][0][0][1],
            x.feature.geometry.coordinates[0][0][0][0],
            categoryToValue(x.feature.properties._damage)
        ]
    )
  }
  // https://github.com/Leaflet/Leaflet.heat
  return L.heatLayer(heatCoordinates, {radius: 30, blur: 15 });

}

function categoryToValue(category) {

  var value
  if (category === "none") {
    value = 0
  } else if (category === "partial") {
    value = 0.2
  } else if (category === "heavy") {
    value = 0.5
  } else if (category === "destroyed") {
    value = 0.8
  } else {
    value = 0
  }
  return value
}