/*

blog2model.js 

Author: Lorien Pratt

Date: July 2015

Copyright (c) Quantellia LLC 2015.  All Rights Reserved. Patent Pending.

This is a test

*/

// TODO: Add a text field in lower left with a narrative
// TODO: Make numbers on sliders appear at start, using
// the init() function: copy the text update line from the
// slider to there to put in the initial value

// TODO: The numbers below don't match the initial numbers on the sliders.  It would
// be good if they did!  The way to do this right would be to generate the slider
// html in code from defined constants.  But in the meantime, probably best to just
// manually check that they're the same.
// 
BLG2.initialInvestment = 1000;
BLG2.trainCostPerHour = 100;
BLG2.totalHoursPurchased = 10;

BLG2.skillLevel = 3;
BLG2.costOfDayDelay = 3000;
BLG2.reductionInProjectDelay = undefined;  // This will be calculated from other values

BLG2.investmentText = document.getElementById("investmentLabel");
BLG2.costPerHourText = document.getElementById("trainingCostLabel");
BLG2.skillLevelText = document.getElementById("avgSkillLevelLabel");
BLG2.totalBenefitText = document.getElementById("projectDelayLabel");
BLG2.modelText = document.getElementById("modelTextDiv");

BLG2.oldTotalBenefitNumber = 0.0;

BLG2.totalDelayReductionChart = undefined;
BLG2.totalInvestmentBenefitGaugeChart = undefined;

//
// MODEL MATH
//

//
function updateModelText() {
    var totalBenefit = BLG2.totalInvestmentBenefit - BLG2.initialInvestment;
    var returnOrLoss = (totalBenefit >= 0 ? 'return' : 'loss');

    BLG2.modelText.innerHTML = "By investing " + '$' + numberWithCommas(BLG2.initialInvestment) +
          ' in training that costs $' + numberWithCommas(BLG2.trainCostPerHour) + " per hour, " +
          numberWithCommas(Math.round(BLG2.totalHoursPurchased)) + ' training hours can be purchased.  Since the average skill level of the workforce before the investment is ' +
          BLG2.skillLevel + ' (on a scale of 1-100), this can produce a skill level improvement of ' +
          BLG2.benefitOfOneTrainingHour + ' (as measured on an assessment test with a scale of 1-10) for every training hour purchased, resulting in a total predicted skills improvement score of ' +
          Math.round(BLG2.totalBenefitsOfAllHours) + '.  Analysis of our historical data shows that this will avoid, on average, ' +
          BLG2.reductionInProjectDelay + ' days of project delay. Project delay days cost the company, on average, $' +
          BLG2.costOfDayDelay + ' each.  This means that the expected benefit from the $' + numberWithCommas(BLG2.initialInvestment) +
          ' initial investment is $' + numberWithCommas(BLG2.totalInvestmentBenefit) +
          ', representing a net ' + returnOrLoss +
          ' of $' + numberWithCommas(Math.abs(totalBenefit)) + '.';
}

//
// Handle change in initial investment
//
//var trainInvestmentSlider = d3.select("#trainInvestmentSlider").on("change", function () {
//    handleChangeInInitialInvestment(this.value);
//
//});
var i4 = document.getElementById('trainInvestmentSlider');
//alert("about to create event listener");

//i4.addEventListener('input', function () {  // THIS IS WHAT I THINK IS REQUIRED TO MAKE IT WORK IN IE AND FIREFOX

i4.addEventListener('change', function () {
    // o.innerHTML = i.value;
 //   alert("Inside slider event");
    handleChangeInInitialInvestment(i4.value);
}, false);

i4.addEventListener('input', function () {
    // o.innerHTML = i.value;
 //   alert("Inside slider event");
    handleChangeInInitialInvestment(i4.value);
}, false);



//
// Do what's needed to handle a change in the initial investment.  This is
// done separately from the event handler so that we can call it from the init 
// function before the slider is moved
//
function handleChangeInInitialInvestment(value) {
    BLG2.initialInvestment = parseInt(value);
    BLG2.investmentText.innerHTML = '$' + numberWithCommas(value);
    //  BLG2.hoursPurchasedGauge.series[0].points[0].update(BLG2.trainCostPerHour * BLG2.initialInvestment);
    updateTotalHoursPurchasedGauge();
    updateModelText();
}

function updateTotalHoursPurchasedGauge() {
    var chart = $('#hoursPurchasedGauge').highcharts();
    var s = chart.series[0];
    var t = s.points[0];
    BLG2.totalHoursPurchased = BLG2.initialInvestment / BLG2.trainCostPerHour;
    t.update(BLG2.totalHoursPurchased);

    updateTotalSkillsBenefit();
    updateModelText();
}

//
// Handle change in training cost per hour
// This is *obsolete* because this did not allow for interactive response - as the slider changed - in 
// Firefox.  See http://www.impressivewebs.com/onchange-vs-oninput-for-range-sliders/ for a bit of the sordid
// history on this topic
//
// yyy
//var trainCostPerHourSlider = d3.select("#trainCostPerHourSlider").on("input", function () {
//    handleTrainCostPerHourUpdate(this.value);
//});

//
// Experiments to make the slider interactive, even on firefox
//
//var i = document.querySelector('trainCostPerHourSlider');
var i = document.getElementById('trainCostPerHourSlider');

i.addEventListener('input', function () {
    // o.innerHTML = i.value;
    handleTrainCostPerHourUpdate(i.value)
}, false);

i.addEventListener('change', function () {
    // o.innerHTML = i.value;
    handleTrainCostPerHourUpdate(i.value)
}, false);

//
// Do what's needed to handle a change in the training cost per hour.  This is
// done separately from the event handler so that we can call it from the init 
// function before the slider is moved
//
function handleTrainCostPerHourUpdate(value) {
    //alert("Inside event handler!");
    BLG2.trainCostPerHour = parseInt(value);
    BLG2.costPerHourText.innerHTML = '$' + numberWithCommas(value);

    updateTotalHoursPurchasedGauge();
    updateModelText();
}

//
// Handle change in skill level
//
//var skillLevelSlider = d3.select("#skillLevelSlider").on("change", function () {
//    handleSkillLevelUpdate(this.value);
//
//});
i2 = document.getElementById('skillLevelSlider');

i2.addEventListener('input', function () {
    handleSkillLevelUpdate(i2.value)
}, false);

i2.addEventListener('change', function () {
    handleSkillLevelUpdate(i2.value)
}, false);



//
// Do what's needed to handle a change in the skill level.  This is
// done separately from the event handler so that we can call it from the init 
// function before the slider is moved
//
function handleSkillLevelUpdate(value) {
    BLG2.skillLevel = parseInt(value);
    //BLG2.hoursPurchasedGauge.chart.series[0].points[0].update(BLG2.trainCostPerHour * BLG2.initialInvestment);
    // This slider can return values between the deciles, e.g. 3, 4.  But the graph dots are only defined
    // for 0, 10, 20, etc. So only call the coloring method if it's on a decile boundary
    if (BLG2.skillLevel % 10 == 0) {
        var chart = $('#benefitOfTrainingHourDiv').highcharts()
        colorOneGraphPoint(BLG2.skillLevel, chart, 'red');
    }
    BLG2.skillLevelText.innerHTML = numberWithCommas(value);
    updateTotalSkillsBenefit();

    updateModelText();
}

//
// Handle change in cost of a day of project delay
//
//var costOfDayDelaySlider = d3.select("#costOfDayDelaySlider").on("change", function () {
//    handleCostOfDayDelay(this.value);
//});

i3 = document.getElementById('costOfDayDelaySlider');

i3.addEventListener('input', function () {
    handleCostOfDayDelay(i3.value)
}, false);

i3.addEventListener('change', function () {
    handleCostOfDayDelay(i3.value)
}, false);
//
//
// Do what's needed to handle a change in the cost of project delay.  This is
// done separately from the event handler so that we can call it from the init 
// function before the slider is moved
//
function handleCostOfDayDelay(value) {
    BLG2.costOfDayDelay = parseInt(value);
    BLG2.totalBenefitText.innerHTML = '$' + numberWithCommas(value);

    // 
    // Execute follow-on functions
    //
    calculateTotalInvestmentBenefit();
}

//
// Calculate the new value for the average benefit to skills gauge and update the view
//
function updateTotalSkillsBenefit() {
    // Pseudocode:
    // Determine benefit of 1 training hour at this current avg skill level: 
    // BLG2.benefitOfOneTrainingHour
    // Determine the benefit per training hour purchased at this current avg skill level:
    // BLG2.totalBenefitsOfAllHours
    // Set this to BLG2.totalBenefitsOfAllHours* BLG2.trainingHoursPurchased

    // Determine benefit of 1 training hour at this current avg skill level: 
    // Do this by looking up the average skill level in the benefit of one training
    // hour plot and reading off the y value: the benefit of one training hour
    var chart = $('#benefitOfTrainingHourDiv').highcharts();
    BLG2.benefitOfOneTrainingHour = getYValue(chart, 0, BLG2.skillLevel);

    BLG2.totalBenefitsOfAllHours = BLG2.benefitOfOneTrainingHour * BLG2.totalHoursPurchased;

    chart = $('#totalSkillBenefitGauge').highcharts();
    //chart = BLG2.totalSkillBenefitChart;  // Not sure why this doesn't work, but oh well.
    var s = chart.series[0];
    var t = s.points[0];
    t.update(BLG2.totalBenefitsOfAllHours);

    var thousandVal;
    //
    // Change the corresponding graph dot to yellow.  Note that
    // there are only 10 dots, though, spaced every 1,000. So only invoke when we've
    // changed to a new dot
    if (Math.abs(BLG2.totalBenefitsOfAllHours - BLG2.oldTotalBenefitNumber) >= 1000) {
        BLG2.oldTotalBenefitNumber = BLG2.totalBenefitsOfAllHours;  // Save old number for next comparison
        thousandVal = Math.round(BLG2.totalBenefitsOfAllHours / 1000.0) * 1000;
        colorOneGraphPoint(thousandVal, BLG2.skillsImpactOnProjectDelayChart, 'yellow');
    }

    // Trigger follow-on calculations
    //
    updateReductionInProjectDelay();
}

//
// Calculate the new value for the expected reduction in project delay
//
function updateReductionInProjectDelay() {

    // Determine total expected project delay reduction
    // Do this by looking it up in the skills impact on project delay graph
    var chart = BLG2.skillsImpactOnProjectDelayChart;
    //        var chart = $('#benefitOfTrainingHourDiv').highcharts();
    BLG2.reductionInProjectDelay = getYValue(chart, 0, BLG2.totalBenefitsOfAllHours);

    //
    // Update the gauge value
    //
    //        chart = BLG2.totalDelayReductionChart; TODO: I'm not sure why this doesn't work, but it doesn't
    chart = $('#totalDelayReductionGauge').highcharts();
    var s = chart.series[0];
    var t = s.points[0];
    t.update(BLG2.reductionInProjectDelay);

    //
    // Do follow-on calculations
    //
    calculateTotalInvestmentBenefit();
}
//
// Also we're getting some slow prformance with the 1000.0 * 1000 etc. line above.  Is
// there something we can do?
function calculateTotalInvestmentBenefit() {
    // Look up BLG2.totalBenefitsOfAllHours in the expected fewer project delay days chart
    // Multiply that number by the value in the cost of a day of project delay slider
    // Put the result into this new gauge
    //Put calls to calculateTotalInvestmentBenefit(); in all the places they belong
    BLG2.totalInvestmentBenefit = BLG2.reductionInProjectDelay * BLG2.costOfDayDelay;

    var chart = $('#totalInvestmentBenefitGauge').highcharts();
    var s = chart.series[0];
    var t = s.points[0];
    t.update(BLG2.totalInvestmentBenefit);

}
//
//
// Helper function: get a y value associated with a particular x value in a chart series
//
function getYValue(chartObj, seriesIndex, xValue) {
    var yValue = null;
    var points = chartObj.series[seriesIndex].points;
    //
    // Go through the list of points from small to large X and find the x that's the last one
    // before a larger index and return the Y value associated with that one
    // Since our x axis is a category, this is points[i].category instead of points[i].x, which is 
    // how it's described at:
    // http://stackoverflow.com/questions/12014412/highcharts-getting-y-value-in-one-series-based-on-x-value-from-another-series
    // and http://jsfiddle.net/jugal/3MVGF/ 
    //
    yValue = points[0].y;       // Handle the case where xValue is 0.  We'll want to return the first yValue, so it will break immediately
    for (var i = 0; i < points.length; i++) {
        if (points[i].category >= xValue) break;
        yValue = points[i].y;
    }
    return yValue;
}
//
// Helperfunction: put thousands separator into a number
//
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function handleChangeInBenefitOfTrainingHour(x, y) {
    // Trigger follow-on functions.  No need to change any values.
    updateTotalSkillsBenefit();
}

function handleChangeinImpactOnProjectDelay(x, y) {
    // Trigger follow-on functions.  No need to change any values.
    // TODO: add call to change to project delay impact display
}

//// Initialize libraries
//// create an instance of math.js
var math = mathjs();
//    
//    BLG2.ticks = 0;
//    BLG2.updatecounter = 0;
//    // counts entries to update function
//    
//    BLG2.scaleFactor = 1.0;
//    // Scale factors from Mark's desktop software
//    BLG2.scale100 = 100;
//    BLG2.scale10 = 10;
//    
//    BLG2.debuggingGUI = undefined;

//    
//    BLG2.indiaEnergyChart = undefined;
//    BLG2.worldWideFuelsChart = undefined;
//    BLG2.fedPrimeRateChart = undefined;
//    BLG2.gdpChart = undefined;
//    BLG2.marketRateChart = undefined;
//    BLG2.forexRateChart = undefined;
//    BLG2.inflationChart = undefined;
//    
//    BLG2.chartlist = [];


//    BLG2.map = undefined;
//    BLG2.geojson = undefined;
//    BLG2.mapinfo = undefined;
//    BLG2.rainbow = undefined;
//    BLG2.radar = undefined;
//    BLG2.radar2 = undefined;
//    BLG2.MSRSliderPos = 1;
//    BLG2.SFMFSliderPos = 1;
//BLG2.statesData = [];

// GLOBALS

BLG2.mydata = [100, 122, 50, 6, 22, 39, 11];
var adata = [5, 4, 9, 9, 4];
var radar2 = undefined;
var spiderinitialized = false;
var mySlideMSR;
var mySlideSFMF;
var slidersSetUp = false;

window.onload = function () {

    init();
    //setUpInterestRateChartList();
    //setUpSliders();
}


function init() {
    // Only put code in here that can run before we set up the various charts that are included in default.html after this file

    colorOneGraphPoint(0,
                BLG2.skillsImpactOnProjectDelayChart, 'yellow');

    handleSkillLevelUpdate(BLG2.skillLevel);
    handleChangeInInitialInvestment(BLG2.initialInvestment);
    handleTrainCostPerHourUpdate(BLG2.trainCostPerHour);
    handleCostOfDayDelay(BLG2.costOfDayDelay);
}

//
// MODEL MATH
//

// Calculate the new fed prime rate at a particular X value. Called when one of the
// antecedent values changes
//    function calculateFedPrimeRate(x)
//    {
//        var DELAYFACTOR = 1; //delayed reaction by 1 year
//        var MAXYEARS = 5; // Number of years of projection
//        var delayedX = math.min(MAXYEARS-1, x + DELAYFACTOR); // -1 is because index goes down to 0
//        // Do some random updates to the other chart to illustrate how this calculation could work
//        BLG2.fedPrimeRateChart.series[0].data[delayedX].update(
//            BLG2.gdpChart.series[0].data[x].y +
//            BLG2.inflationChart.series[0].data[x].y*100.0
//            );
//        

//    }

//    function calculateMarketRate(x)
//    {
//        var DELAYFACTOR = 1; //delayed reaction by 1 year
//        var MAXYEARS = 5; // Number of years of projection
//        var delayedX = math.min(MAXYEARS-1, x + DELAYFACTOR);
//        // Do some random updates to the other chart to illustrate how this calculation could work
//        BLG2.marketRateChart.series[0].data[delayedX].update(
//            BLG2.fedPrimeRateChart.series[0].data[x].y +
//            BLG2.forexRateChart.series[0].data[x].y * 20
//            );

//    }


// 
// FUNCTIONS TO HELP WITH INTEREST RATE DISPLAY
//

//    function showInterestModel()
//    {
//        document.getElementById('multipleInterestRateChartsDiv').style.visibility = 'visible';
//        document.getElementById('fedPrimeRateButton').style.visibility = 'hidden';
//        HideAllCharts(); // Hide the moving charts on top of the model until the button is pressed to show them
//    }

//    function hideInterestModel()
//    {
//        HideAllCharts();
//        document.getElementById('multipleInterestRateChartsDiv').style.visibility = 'hidden';
//        document.getElementById('fedPrimeRateButton').style.visibility = 'visible';
//        document.getElementById('buttonAdjust').style.visibility = 'hidden';
//        document.getElementById('buttonHide').style.visibility = 'hidden';

//    }

//    function setUpInterestRateChartList()
//    {
//        BLG2.chartlist.push('fedPrimeRateChartDiv');
//        BLG2.chartlist.push('forexRateChartDiv');
//        BLG2.chartlist.push('marketRateChartDiv');
//        BLG2.chartlist.push('inflationChartDiv');
//        BLG2.chartlist.push('gdpChartDiv');

//        HideAllCharts();
//        document.getElementById('buttonAdjust').style.visibility = 'hidden';

//    }

//    function ShowAllCharts()
//    {
//        for (var i = 0; (i < BLG2.chartlist.length); i++)
//        {
//            var x = document.getElementById(BLG2.chartlist[i]);
//            document.getElementById(BLG2.chartlist[i]).style.visibility = 'visible';
//            document.getElementById(BLG2.chartlist[i]).style.display = 'block';
//        }

//        //                document.getElementById('fedPrimeRateChartDiv').style.visibility = 'visible';
//        //                document.getElementById('fedPrimeRateChartDiv').style.display = 'block';
//        BLG2.fedPrimeRateChart.series[0].show();
//        BLG2.forexRateChart.series[0].show();
//        BLG2.marketRateChart.series[0].show();
//        BLG2.inflationChart.series[0].show();
//        BLG2.gdpChart.series[0].show();
//        //series.show();


//        //$('#fedPrimeRate').find('highcharts-container').show();


//        //series.hide();

//        //BLG2.fedPrimeRateChart.legend.enabled = true;
//        //BLG2.fedPrimeRateChart.xAxis.show();
//        //$('#fedPrimeRate').find('highcharts-container').setVisible(true);

//        // Show the "Hide" button and hide the "Adjust" button
//        document.getElementById('buttonAdjust').style.visibility = 'hidden';
//        document.getElementById('buttonHide').style.visibility = 'visible';
//    }
//    function HideAllCharts()
//    {
//        for (var i = 0; (i < BLG2.chartlist.length); i++)
//        {
//            var x = document.getElementById(BLG2.chartlist[i]);
//            document.getElementById(BLG2.chartlist[i]).style.visibility = 'hidden';
//            document.getElementById(BLG2.chartlist[i]).style.display = 'none';
//        }

//        BLG2.fedPrimeRateChart.series[0].hide();
//        BLG2.forexRateChart.series[0].hide();
//        BLG2.marketRateChart.series[0].hide();
//        BLG2.inflationChart.series[0].hide();
//        BLG2.gdpChart.series[0].hide();


//        //alert(text);
//        //                var series = BLG2.fedPrimeRateChart.series[0];
//        //                series.hide();
//        //                document.getElementById('fedPrimeRateChartDiv').style.visibility = 'hidden';
//        //                document.getElementById('fedPrimeRateChartDiv').style.display = 'none';

//        // Show the "Adjust" button and hide the "Hide" button
//        document.getElementById('buttonAdjust').style.visibility = 'visible';
//        document.getElementById('buttonHide').style.visibility = 'hidden';


//    }


    
  
