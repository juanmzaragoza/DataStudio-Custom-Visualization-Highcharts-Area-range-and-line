const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');

//const Highcharts = require('highcharts');
import * as Highcharts from 'highcharts';
require('highcharts/highcharts-more')(Highcharts);
require('highcharts/modules/solid-gauge')(Highcharts);
require('highcharts/modules/heatmap')(Highcharts);
require('highcharts/modules/treemap')(Highcharts);
require('highcharts/modules/funnel')(Highcharts);

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

// write viz code here
const drawViz = (data) => {
  let rowData = data.tables.DEFAULT;
console.log(JSON.stringify(rowData))
  // create element container
  const div = document.createElement('div');
  div.setAttribute('id', 'container');
  document.body.appendChild(div);

  const title = 'Some descriptive title';
  const yAxisTitle = 'Y title';
  const seriesName = 'Value';
  const tooltipValueSuffix = '°C';

  let averages = rowData.map(function (row) {
    return [new Date(extractAValidDateFrom(row)).getTime(),row["valueMetricID"][0]];
  });

  let ranges = rowData.map(function (row) {
    return [new Date(extractAValidDateFrom(row)).getTime(),row["minRangeMetricID"][0],row["maxRangeMetricID"][0]];
  });

  // create chart
  Highcharts.chart('container', {

    title: {
      text: title
    },

    xAxis: {
      type: 'datetime',
      accessibility: {
        rangeDescription: 'Range: Jul 1st 2009 to Jul 31st 2009.'
      }
    },

    yAxis: {
      title: {
        text: yAxisTitle
      }
    },

    tooltip: {
      crosshairs: true,
      shared: true,
      valueSuffix: tooltipValueSuffix
    },

    series: [
      {
        name: seriesName,
        data: averages,
        zIndex: 1,
        marker: {
          fillColor: 'white',
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[0]
        }
      },
      {
        name: 'Range',
        data: ranges,
        type: 'arearange',
        lineWidth: 0,
        linkedTo: ':previous',
        color: Highcharts.getOptions().colors[0],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
          enabled: false
        }
      }
    ]
  });
};

function extractAValidDateFrom(row){
  const date = row["dateDimensionID"][0];
  return date.substring(0, 4) + '-' + date.substring(4,6) + '-' + date.substring(6,8);
}

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
