//
// See http://jsfiddle.net/gh/get/jquery/1.9.1/highslide-software/highcharts.com/tree/master/samples/highcharts/demo/gauge-solid/ 
// for guidance
//
$(function ()
{
    var gaugeOptions = {

        chart: {
            type: 'solidgauge'
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            //size: '140%',
            size: '160%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
//                [0.1, '#55BF3B'], // green
//                [0.5, '#DDDF0D'], // yellow
//                [0.9, '#DF5353'] // red

                [0.1, '#DDDF0D'], // yellow
                [0.5, '#3182bd'], // dark blue
                [0.8, '#addd8e'], // mid-green
                [0.9, '#31a354'] // darker green
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                y: -70,
            },
            labels: {
                y: 16,
            }
        },

        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        }
    };

    // The speed gauge
    BLG2.totalInvestmentBenefitGaugeChart = $('#totalInvestmentBenefitGauge').highcharts(
      Highcharts.merge(
        gaugeOptions, {
            title: {
                text: "Total investment benefit",
                style: {
                    color: 'black',
                    fontSize: '10px',
                    padding: '0px',
                    margin: '0px'
                    //fontWeight: 'bold'
                }
            //            x: 100,
            //            y: 2
            },
            yAxis: {
                min: 0,
                max: 10000,
//                title: {
//                    text: 'Investment Benefit'
//                },
            },

            credits: {
                enabled: false
            },

            series: [{
                name: 'Dollars',
                data: [80],
                dataLabels: {
                //    format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                //    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                //       '<span style="font-size:12px;color:silver">hrs</span></div>'
                format: '<div style="text-align:center"><span style="font-size:25px;color:' +
                    ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">${point.y:,.0f}</span><br/>' +
                       '<span style="font-size:12px;color:silver"></span></div>'
                },
                tooltip: {
                    valueSuffix: ' dollars'
                }
            }]

        }));

    // Bring life to the dials
//    setInterval(function ()
//    {
//        // Speed
//        var chart = $('#hoursPurchasedGauge').highcharts(),
//            point,
//            inc;

//        if (chart)
//        {
//            var newVal;
//            point = chart.series[0].points[0];
////            inc = Math.round((Math.random() - 0.5) * 100);
////            newVal = point.y + inc;

////            if (newVal < 0 || newVal > 200)
////            {
////                newVal = point.y - inc;
////            }
//            //newVal = BLG2.initialInvestment * BLG2.trainCostPerHour;

//           // point.update(newVal);
//        }


//    });
});
