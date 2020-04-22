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

// Load the fonts
Highcharts.createElement('link', {
  href: 'https://fonts.googleapis.com/css?family=Signika:400,700',
  rel: 'stylesheet',
  type: 'text/css'
}, null, document.getElementsByTagName('head')[0]);


function changeThemeColor(color) {
  Highcharts.theme = {
    colors: [color],
    chart: {
      backgroundColor: null,
      style: {
        fontFamily: 'Signika, serif'
      }
    },
    title: {
      style: {
        color: 'black',
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      style: {
        color: 'black'
      }
    },
    tooltip: {
      borderWidth: 0
    },
    labels: {
      style: {
        color: '#6e6e70'
      }
    },
    legend: {
      backgroundColor: '#E0E0E8',
      itemStyle: {
        fontWeight: 'bold',
        fontSize: '13px'
      }
    },
    xAxis: {
      labels: {
        style: {
          color: '#6e6e70'
        }
      }
    },
    yAxis: {
      labels: {
        style: {
          color: '#6e6e70'
        }
      }
    },
    plotOptions: {
      series: {
        shadow: true
      },
      candlestick: {
        lineColor: '#404048'
      },
      map: {
        shadow: false
      }
    },
    // Highstock specific
    navigator: {
      xAxis: {
        gridLineColor: '#D0D0D8'
      }
    },
    rangeSelector: {
      buttonTheme: {
        fill: 'white',
        stroke: '#C0C0C8',
        'stroke-width': 1,
        states: {
          select: {
            fill: '#D0D0D8'
          }
        }
      }
    },
    scrollbar: {
      trackBorderColor: '#C0C0C8'
    }
  };
  // Apply the theme
  Highcharts.setOptions(Highcharts.theme);
}

// write viz code here
const drawViz = (data) => {
  let rowData = data.tables.DEFAULT;

  // styles
  let color = data.style.themeColor.value && data.style.themeColor.value.color? data.style.themeColor.value.color:'#6ed597';
  changeThemeColor(color);

  // create element container
  const div = document.createElement('div');
  div.setAttribute('id', 'container');
  document.body.appendChild(div);

  const title = '';
  const seriesName = rowData[0]["nameValueID"] && rowData[0]["nameValueID"][0]? ' '+rowData[0]["nameValueID"][0]:data.fields.valueMetricID[0].name;
  const tooltipValueSuffix = rowData[0]["unitMetricID"] && rowData[0]["unitMetricID"][0]? ' '+rowData[0]["unitMetricID"][0]:'';
  const yAxisTitle = tooltipValueSuffix;

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
        rangeDescription: 'Range: Jul 1st 2009 to Jul 31st 2049.'
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
