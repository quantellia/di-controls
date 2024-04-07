$(function () {
  var ecount = 0;

  // X axis is 1 to 10,000.
  var xAxisData = [];
  var yAxisData = [0, 1, 2, 3, 5, 7, 9, 20, 30, 40];

  //
  // Create data for the X axis
  //
  for (var i = 0; i <= 10000; i += 1000) {
    xAxisData.push(i); // Test data for now
  }

  //for (var i = 0; i < 10; i++)
  // {
  //     yAxisData.push(i); // Test data for now
  // }

  BLG2.skillsImpactOnProjectDelayChart = new Highcharts.Chart({
    chart: {
      renderTo: "skillsImpactOnProjectDelayDiv",
      animation: true,
      zoomType: "x",
      type: "area",
      backgroundColor: "transparent",
      //height: 180,
      //width: 700
      //plotBackgroundColor: '#ffcc00',
      //plotBackgroundImage: 'images/india-night.jpg'
    },

    credits: {
      enabled: false,
    },

    title: {
      text: "Skills improvement->proj delay reduction",
      //floating: true,
      align: "left",
      style: {
        color: "black",
        fontSize: "10px",
        //fontWeight: 'bold'
      },
      //            x: 100,
      //            y: 20
    },

    legend: {
      enabled: false,
      style: {
        color: "black",
        fontSize: "6px",
        //fontWeight: 'bold'
      },
      text: "Skill improvement/hour",
    },

    xAxis: {
      //categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      //categories: ['1', '2', '3', '4', '5'],
      categories: xAxisData,
      labels: {
        style: {
          color: "black",
          fontSize: "6px",
        },
      },
    },

    yAxis: {
      title: {
        style: {
          color: "black",
          fontSize: "6px",
        },
        text: "Days",
      },
      max: 40,
      labels: {
        style: {
          color: "black",
          fontSize: "6px",
          padding: 0,
        },
      },
    },

    plotOptions: {
      series: {
        stacking: "normal",
        cursor: "ns-resize",
        point: {
          events: {
            drag: function (e) {
              // Returning false stops the drag and drops. Example:
              /*
                    if (e.newY > 300) {
                    this.y = 300;
                    return false;
                    }
                    */
              // $('#drag').html('Dragging <b>' + this.series.name + '</b>, <b>' + this.category + '</b> to <b>' + Highcharts.numberFormat(e.newY, 2) + '</b>');

              handleChangeinImpactOnProjectDelay(
                Math.round(this.x),
                Math.round(this.y)
              );
            },
            drop: function () {
              //$('#drop').html('In <b>' + this.series.name + '</b>, <b>' + this.category + '</b> was set to <b>' + Highcharts.numberFormat(this.y, 2) + '</b>');
              //
              // Can we trigger the onChange in GUI.dat here?
              handleChangeinImpactOnProjectDelay(
                Math.round(this.x),
                Math.round(this.y)
              );
            },
            update: function (event) {
              // Update the gauge that depends on this
              updateReductionInProjectDelay();
            },
          },
        },
        stickyTracking: false,
      },
    },

    tooltip: {
      //yDecimals: 2,
      // pointFormat from: http://jsfiddle.net/gh/get/jquery/1.7.2/highslide-software/highcharts.com/tree/master/samples/highcharts/tooltip/pointformat/
      //pointFormat: '{series.name}: <b>{point.y:,.0f}</b><br/>',
      formatter: function () {
        var x = Math.round(this.x);
        var y = Math.round(this.y);
        return (
          "With skill improvement of " +
          x +
          ",<br />" +
          y +
          " fewer days proj delay expected"
        );
        //return 'The value for <b>' + this.x + '</b> is <b>' + this.y + '</b>, in series '+ this.series.name;
      },
      positioner: function () {
        return { x: 40, y: 24 };
      },
      shadow: false,
      backgroundColor: "rgba(255,255,255,0.6)",
      crosshairs: [true, true],
    },

    series: [
      {
        //data: [32, 71.5, 106.4, 129.2, 144.0],
        data: yAxisData,
        //draggableX: true,
        draggableY: true,
        dragMinY: 0,
        dragMaxY: 50,
        type: "area",
        minPointLength: 2,
        name: "Avg Improvement",
      },
      //        {
      //            data: [0, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4].reverse(),
      //            draggableY: true,
      //            dragMinY: 0,
      //            type: 'area',
      //            name: 'biofuels',
      //            minPointLength: 2
      //        }
    ],
  });
}); //]]>

//
// Make the point red that corresponds to the currently selected skill level
// from: http://jsfiddle.net/yPT73/1/ to change color of point that's active.  Set to null to return to default.
//
function colorOneGraphPoint(xValue, chart, newFillColor) {
  var s = chart.series[0];
  // i  t.x[i]  t.y[i] math.round(t.plotY)
  // 0    0       10
  // 1    1       9
  // 2    2       8   20
  // 3    3       8

  // TODO: there's probably a more efficient way to do this that doesn't
  // require the loop: look up the right value and save the old one to reset
  // the next time around
  //for (var i=0;i<11;i++)  // There are 11 points: 0, 10, 20,..., 100
  for (
    var i = 0;
    i < s.points.length;
    i++ // There are 11 points: 0, 10, 20,..., 100
  ) {
    var t = s.points[i]; // Get a reference to this point
    //if (i == xValue)
    // Is this point the one closest to xValue?
    if (t.category == xValue) {
      t.update({
        marker: {
          fillColor: newFillColor,
        },
      });
    } // Reset other points to default color in case we changed them before
    else {
      t.update({
        marker: {
          fillColor: null,
        },
      });
    }
  }
}
