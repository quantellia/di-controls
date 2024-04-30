/*
* D3 Tools for World Modeler
*/



var svgNS = "http://www.w3.org/2000/svg";

var plotAreaList = new Array();
var formatBuffer = document.createElement("INPUT");



var plotAreaList = new Array();


function WMD3AjaxUpdate(url, params, instance, responseHandler) {


    var xmlhttp = new XMLHttpRequest();

    if (responseHandler != null) {
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                responseHandler(instance, xmlhttp.responseText);
            }
        }
    }

    xmlhttp.open("POST", url, true);

    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Content-length", params.length);
    xmlhttp.setRequestHeader("X-Requested-With", "XmlHttpRequest");
    xmlhttp.setRequestHeader("Connection", "close");

    xmlhttp.send(params);
}


function WMD3PlotArea(ownerID, params) {

    this.dataSeries = new Array();

    this.owner = document.getElementById(ownerID);
    this.owner.chart = this;

    this.xAxisLabelsOffset = 15;

    var owner_rect = this.owner.getBoundingClientRect();

    this.margin = (params != null && params.margin != null) ? params.margin : { top: 20, right: 30, bottom: 30, left: 40 };
    this.width = owner_rect.width - this.margin.left - this.margin.right;
    this.height = owner_rect.height - this.margin.top - this.margin.bottom - this.xAxisLabelsOffset;

    this.xAxisClassName = (params != null && params.xAxisClassName != null) ? params.xAxisClassName : "WMAxis";
    this.yAxisClassName = (params != null && params.yAxisClassName != null) ? params.yAxisClassName : "WMAxis";

    this.xAxisCaption = (params != null && params.xAxisCaption != null) ? params.xAxisCaption : "";
    this.yAxisCaption = (params != null && params.xAxisCaption != null) ? params.yAxisCaption : "";

    this.xAxisTickSize = (params != null && params.xAxisTickSize != null) ? params.xAxisTickSize : -this.height;
    this.yAxisTickSize = (params != null && params.yAxisTickSize != null) ? params.yAxisTickSize : -this.width;

    this.xAxisLabelRotation = (params != null && params.xAxisLabelRotation != null) ? params.xAxisLabelRotation : 0;

    var x_domain = (params == null || params.xDomain == null) ? [1, 2, 3, 4, 5, 6, 7] : params.xDomain;
    var y_domain = (params == null || params.yDomain == null) ? [0, 10] : params.yDomain;

    this.xOrdinalPad = (params == null || params.xOrdinalPad == null) ? 0 : params.xOrdinalPad;

    this.xScaleType = (params != null && params.xScaleType != null) ? params.xScaleType : "ordinal";
    switch (this.xScaleType) {
        case "ordinal":
            this.xScale = d3.scale.ordinal();
            this.xScale.rangeRoundBands([0, this.width],this.xOrdinalPad).domain(x_domain);
            break;
        case "linear":
            this.xScale = d3.scale.linear();
            break;
        case "power":
            this.xScale = d3.scale.pow();
            break;
        case "log":
            this.xScale = d3.scale.log();
            break;
        case "quantize":
            this.xScale = d3.scale.quantize();
            break;
        case "quantile":
            this.xScale = d3.scale.quantile();
            break;
        case "threshold":
            this.xScale = d3.scale.threshold();
            break;
        case "time":
            this.xScale = d3.time.scale();
            break;
        default:
            this.xScaleType = "ordinal";
            this.xScale = d3.scale.ordinal();
            break;
    }


    this.yScaleType = (params != null && params.yScaleType != null) ? params.yScaleType : "linear";
    switch (this.yScaleType) {
        case "ordinal":
            this.yScale = d3.scale.ordinal();
            break;
        case "linear":
            this.yScale = d3.scale.linear();
            this.yScale.range([0, this.height]).domain([d3.max(y_domain), d3.min(y_domain)]);
            break;
        case "power":
            this.yScale = d3.scale.pow();
            break;
        case "log":
            this.yScale = d3.scale.log();
            break;
        case "quantize":
            this.yScale = d3.scale.quantize();
            break;
        case "quantile":
            this.yScale = d3.scale.quantile();
            break;
        case "threshold":
            this.yScale = d3.scale.threshold();
            break;
        case "time":
            this.yScale = d3.time.scale();
            break;
        default:
            this.yScaleType = "linear";
            this.yScale = d3.scale.linear();
            break;
    }

    
    this.xAxis = d3.svg.axis()
                .scale(this.xScale)
                .tickSize(this.xAxisTickSize, 0, 0)
                .orient("bottom");

    if (this.xTickFormat != null)
        this.xAxis.tickFormat(this.xTickFormat);

    this.yAxis = d3.svg.axis()
                 .scale(this.yScale)
                 .tickSize(this.yAxisTickSize, 0, 0)
                 .orient("left");
    var selection = d3.select('#' + ownerID);
    var x_axis_svg = selection.append("g")
                  .attr("id", ownerID + "xAxis")
                  .attr("class", this.xAxisClassName)
                  .attr("transform", "translate(0," + (Number(this.height) + Number(this.margin.top)) + ")")
                  .call(this.xAxis);

    if (this.xAxisLabelRotation != 0) {

        var offset = this.xScale.rangeBand() / 2;
        x_axis_svg.selectAll("text")
                  .style("text-anchor", "start")
                  .attr("transform", "rotate(" + this.xAxisLabelRotation + ")")

    }

    selection.append("text")
                  .attr("y", this.height)
                  .attr("x", this.width)
                  .attr("dy", this.margin.top + this.margin.bottom)
                  .style("text-anchor", "end")
                  .text(this.xAxisCaption);

    selection.append("g")
                  .attr("id", ownerID + "yAxis")
                  .attr("class", this.yAxisClassName)
                  .attr("dy", "1em")
                  .attr("transform", "translate(0," + Number(this.margin.top) + ")")
                  .call(this.yAxis);
    //var y_axis_bbox = document.getElementById(ownerID + "yAxis").getBBox();

    selection.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", "-3em")
                  .attr("dx", "-" + Number(this.height) / 2 + "px")
                  .style("text-anchor", "center")
                  .text(this.yAxisCaption);


    this.addDataSeries = function (nameKey, dsValue, params) {
        dsValue.name = nameKey;
        this.dataSeries.push(dsValue);
        dsValue.chart = this;
        if (params == null || params.noRender == null || params.noRender != "Y") {
            dsValue.renderData();
        }
    };

    this.updateDataSeries = WMD3UpdateDataSeries;


    this.removeDataSeries = function (nameKey) {
                            var ds = this.removeDataSeriesDisplayElements(nameKey);
                            this.dataSeries.pop(ds);
                        };
    
    
    this.updateXAxis = function (data) {
                            //this.xScale = d3.scale.ordinal().rangeRoundBands([0, this.width], this.ordinalXWidthFactor).domain(data);
                            this.xScale = d3.time.scale().domain(data);
                            this.xScale.range = [0, this.width];
                            this.xAxis.scale = this.xScale;
                            var selection = d3.select('#' + this.owner.id);

                            d3.select('#' + this.owner.id + 'xAxis').remove();

                            this.xAxis = d3.svg.axis()
                                                        .scale(this.xScale)
                                                        .tickSize(-this.height, 0, 0)
                                                        .orient("bottom");
                            var x_axis_svg = selection.append("g")
                                                           .attr("id", this.owner.id + "xAxis")
                                                          .attr("class", this.xAxisClassName)
                                                          .attr("transform", "translate(0," + (Number(this.height) + Number(this.margin.top)) + ")")
                                                          .call(this.xAxis);
                        };


    this.updateYAxis = function () {
                            var y_domain_union = new Array();

                            for (var i = 0; i < this.dataSeries.length; ++i)
                                y_domain_union = y_domain_union.concat(this.dataSeries[i].dataPoints);

                            if (y_domain_union.length > 1)
                                this.yScale.domain([d3.max(y_domain_union), d3.min(y_domain_union)]);
                            else
                                this.yScale.domain([1, 0]);

                            var top = this.yScale.domain()[0] + (this.yScale.domain()[0] - this.yScale.domain()[1]) * Number(this.yAxisTopMarginFactor);
                            var bottom = this.yScale.domain()[1] - (this.yScale.domain()[0] - this.yScale.domain()[1]) * Number(this.yAxisBottomMarginFactor);

                            this.yScale.domain([top, bottom]);

                            d3.select("#" + this.owner.id + "yAxis").call(this.yAxis);
                        };

    this.owner.addEventListener("mouseover",
                    function () {
                            for (var i = 0; i < this.chart.dataSeries.length; ++i)
                                this.chart.dataSeries[i].setHandleVisibility("visible");
                        });

    this.owner.addEventListener("mouseout",
                    function () {
                        for (var i = 0; i < this.chart.dataSeries.length; ++i)
                            this.chart.dataSeries[i].setHandleVisibility("hidden");
                    });
}


function valuesXMLToArray(valuesXML) {
    var xml_doc = GetXMLDoc(valuesXML);
    var data = new Array();

    var values = xml_doc.getElementsByTagName("value");
    if (values != null) {
        for (var i = 0; i < values.length; ++i) {
            if (!isNaN(Number(values[i].textContent)))
                data.push(Number(values[i].textContent));
            else {
                if (!isNaN(Date.parse(values[i].textContent)))
                    data.push(new Date(values[i].textContent));
                else
                    data.push(values[i].textContent);
            }
        }
    }

    return data;
}

function IsArray(obj) {
    return obj.push != null;
}

function WMD3DataSeries(nameKey, data, params) {

    this.name = nameKey;
    this.dataSeriesType = (params != null && params.dataSeriesType != null) ? params.dataSeriesType : 'Column';  // 'Column','Stacked Column', 'Line', 'Area', 'Stacked Area'
    this.dataSourceType = (data == null || IsArray(data)) ? "pointarray" : "ajaxrequest";
    this.style = (params != null && params.style != null) ? params.style : "fill:gray;";  // 'Column','Stacked Column', 'Line', 'Area', 'Stacked Area'
    this.handleSize = (params != null && params.handleSize != null) ? params.handleSize : 0;  // 'Column','Stacked Column', 'Line', 'Area', 'Stacked Area'
    this.handleStyle = (params != null && params.handleStyle != null) ? params.handleStyle : this.style + ";stroke:gray;cursor:pointer";  // 'Column','Stacked Column', 'Line', 'Area', 'Stacked Area'
    this.preserveSum = (params != null && params.preserveSum != null) ? params.preserveSum : false;
    this.showHandlesOnHover = (params != null && params.showHandlesOnHover != null) ? params.showHandlesOnHover : true;
    this.displayElements = new Array();


    if (this.dataSourceType == "pointarray") {
        this.dataPoints = data;
        this.dataSource = "Array";
        this.dataSum = 0;
        for (var i = 0; i < this.dataPoints.length; ++i)
            this.dataSum = this.dataSum + this.dataPoints[i];
    }
    else
        this.dataSource = data;

    this.displayElements = new Array();

    this.loadData = function () {
        if (this.dataSourceType == "ajaxrequest")
            WMD3AjaxUpdate(document.URL, this.dataSource, this, WMD3HandleDataSeriesRequest);
        else
            this.renderData();
    }

    this.renderData = function () {
        switch (this.dataSeriesType) {
            default:
                (new WMD3DataSourceColumnRednderer(this)).renderData();
                break;
        }
    };

    this.updateData = function (data) {

        for (var i = 0; i < this.displayElements.length; ++i)
            this.displayElements[i].parentNode.removeChild(this.displayElements[i]);


        this.displayElements = new Array();
        this.dataPoints = data;

        this.dataSum = 0;
        for (var i = 0; i < this.dataPoints.length; ++i)
            this.dataSum = this.dataSum + this.dataPoints[i];

        this.renderData();

    };


    this.setHandleVisibility = function (visState) {
        for (var i = 0; i < this.displayElements.length; ++i) {

            var elem = this.displayElements[i];

            if (elem.id.indexOf("_handle") > 0) {
                if (visState == "visible")
                    elem.setAttribute("style", elem.getAttribute("style").replace("hidden", "visible"));
                else
                    elem.setAttribute("style", elem.getAttribute("style").replace("visible", "hidden"));
            }
        }
    };
}


function WMD3DataSourceColumnRednderer(ds) {
    this.dataSeries = ds;
    this.chart = ds.chart;

    this.renderData = function () {
        var x_scale = this.chart.xScale;
        var y_scale = this.chart.yScale;
        var bar_width = 0;
        if (this.dataSeries.dataPoints.length > 0) {
            if (this.chart.xScaleType == "ordinal")
                bar_width = x_scale.rangeBand();
            else
                bar_width = (chart.width - chart.margin.left - chart.margin.right) / this.dataSeries.dataPoints.length;
        }

        var ds_offset = 0; // ds_index * bar_width;

        for (var i = 0; i < this.dataSeries.dataPoints.length; ++i) {

            var bar = document.createElementNS(svgNS, "rect");
            bar.setAttribute("width", bar_width);
            bar.setAttribute("height", this.chart.height - y_scale(this.dataSeries.dataPoints[i]));
            bar.setAttribute("x", 0);
            bar.setAttribute("y", y_scale(this.dataSeries.dataPoints[i]) + this.chart.margin.top);
            bar.setAttribute("transform", "translate(" + x_scale.range()[i] + ", 0)");
            bar.setAttribute("style", this.dataSeries.style);
            bar.setAttribute("id", this.dataSeries.chart.owner.id + this.dataSeries.name.replace(/\w/g, "") + "_bar" + i);

            bar.dataSeries = this.dataSeries;

            this.chart.owner.appendChild(bar);
            this.dataSeries.displayElements.push(bar);

            var visibility = (this.dataSeries.showHandlesOnHover) ? ";visibility:hidden" : ";visibility:visible";

            if (this.dataSeries.handleSize > 0) {
                var handle = document.createElementNS(svgNS, "circle");
                handle.setAttribute("cx", x_scale.range()[i] + (bar_width / 2));
                handle.setAttribute("cy", bar.getAttribute("y"));
                handle.setAttribute("r", this.dataSeries.handleSize);
                handle.setAttribute("style", this.dataSeries.handleStyle + visibility);
                handle.setAttribute("chart", this.chart);
                handle.setAttribute("id", this.dataSeries.chart.owner.id + this.dataSeries.name.replace(/\w/g, "") + "_handle" + i);

                handle.associatedelement = bar;
                handle.dataSeries = this.dataSeries;
                handle.index = i;

                handle.addEventListener("mousedown",
                        function (evt) {
                            this.isHandleMoving = true;
                        });

                handle.addEventListener("mouseup",
                        function (evt) {
                            this.isHandleMoving = false;
                        });

                handle.addEventListener("mouseout",
                        function (evt) {
                            this.isHandleMoving = false;
                        });

                handle.addEventListener("mousemove",
                        function (evt) {

                            var bounds = this.parentNode.getBoundingClientRect();
                            var y_pos = (evt.clientY || evt.LayerY) - bounds.top;
                            var chart_height = d3.max(this.parentNode.chart.yScale.range());

                            if (this.isHandleMoving == true) {// && y_pos < bounds.bottom && y_pos > bounds.top) {
                                this.setAttribute("cy", y_pos);
                                this.associatedelement.setAttribute("y", y_pos);
                                this.associatedelement.setAttribute("height", chart_height - y_pos + this.parentNode.chart.margin.top);

                                var new_val = this.parentNode.chart.yScale.invert(y_pos - this.parentNode.chart.margin.top);

                                if (this.dataSeries.preserveSum == true) {
                                    var sum_ratio = (this.dataSeries.dataSum - new_val) / (this.dataSeries.dataSum - this.dataSeries.dataPoints[this.index]);

                                    for (var i = 0; i < this.dataSeries.dataPoints.length; ++i) {
                                        if (i != this.index) {
                                            this.dataSeries.dataPoints[i] = this.dataSeries.dataPoints[i] * sum_ratio;
                                            var delta_bar = document.getElementById(this.dataSeries.chart.owner.id + this.dataSeries.name.replace(/\w/g, "") + "_bar" + i);
                                            var delta_handle = document.getElementById(this.dataSeries.chart.owner.id + this.dataSeries.name.replace(/\w/g, "") + "_handle" + i);
                                            delta_bar.setAttribute("y", this.parentNode.chart.yScale(this.dataSeries.dataPoints[i]) + this.parentNode.chart.margin.top);
                                            delta_bar.setAttribute("height", chart_height - this.parentNode.chart.yScale(this.dataSeries.dataPoints[i]));
                                            delta_handle.setAttribute("cy",delta_bar.getAttribute("y"));
                                        }
                                    }

                                }
                                this.dataSeries.dataPoints[this.index] = new_val;
                            }
                        });

                this.chart.owner.appendChild(handle);
                this.dataSeries.displayElements.push(handle);
            }
        }
    };
}

function WMD3HandleDataSeriesRequest(dsInstance, httpResponse) {
    dsInstance.dataPoints = valuesXMLToArray(httpResponse);
    dsInstance.dataSum = 0;
    for (var i = 0; i < dsInstance.dataPoints.length; ++i)
        dsInstance.dataSum = dsInstance.dataSum + dsInstance.dataPoints[i];
    dsInstance.renderData();
}



function WMD3UpdateDataSeries(nameKey, data) {

    var ds = this.removeDataSeriesDisplayElements(nameKey);
    ds.dataPoints = data;
    this.renderData();
}



function WMD3Slider(ownerID, params) {

    this.createSliderScale = WMD3CreateSliderScale;
    this.setSliderRange = WMD3SetSliderRange;
    this.linkTo = WMD3LinkSliderToInput;
    this.getValue = WMD3GetSliderValue;
    this.setValue = WMD3SetSliderValue;

    this.linkedControls = new Array();

    this.owner = document.getElementById(ownerID);

    var owner_rect = this.owner.getBoundingClientRect();

    this.margin = (params != null && params.margin != null) ? params.margin : { top: 0, right: 15, bottom: 5, left: 15 };
    this.width = owner_rect.width - this.margin.left - this.margin.right;
    this.height = owner_rect.height - this.margin.top - this.margin.bottom;
    this.slotWidth = (params != null && params.slotWidth != null) ? params.slotWidth : 5;
    this.scaleClassName = (params != null && params.scaleClassName != null) ? params.scaleClassName : "WMSliderScale";
    this.scaleLabelRotation = (params != null && params.scaleLabelRotation != null) ? params.scaleLabelRotation : "0";
    this.scaleCaption = (params != null && params.scaleCaption != null) ? params.scaleCaption : "";

    var scaleDomain = (params == null || params.domain == null) ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : params.domain;
    this.createSliderScale(scaleDomain);
    var selection = d3.select('#' + this.owner.id);

    selection.append("text")
                  .attr("y", this.height)
                  .attr("x", this.width)
                  .attr("dy", this.margin.top + this.margin.bottom)
                  .style("text-anchor", "end bottom")
                  .text(this.scaleCaption);

    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " L " + (this.width + this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.width + this.margin.left + this.slotWidth / 2).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " Z")
                  .attr("class", this.scaleClassName)
                  .attr("fill", "#C0C0C0")
                  .attr("stroke", "#A0A0A0")
                  .attr("stroke-width", 1);



    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 1 " +
                              (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " L " + (this.width + this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString())// +
    //" A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 1 " +
    //(this.width - this.margin.right + this.slotWidth/2).toString() + "," + (this.height / 2).toString())
                  .attr("class", this.scaleClassName)
                  .attr("fill", "none")
                  .attr("stroke", "black")
                  .attr("storke-thickness", 1);

    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " L " + (this.width / 2).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.width / 2).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " Z")
                  .attr("class", this.scaleClassName)
                  .attr("fill", "#E0F0FF")
                  .attr("stroke", "none")
                  .attr("stroke-width", 0)
                  .attr("id", ownerID + "slotHighlight");

    selection.append("circle")
                   .attr("cx", this.width / 2)
                   .attr("cy", this.height / 2)
                   .attr("r", 10)
                   .attr("fill", "white")
                   .attr("stroke", "Gray")
                   .attr("stroke-thickness", 1)
                   .attr("cursor", "pointer")
                   .attr("draggable", "false")
                   .attr("id", ownerID + "sliderButton");

    var slider_button = document.getElementById(ownerID + "sliderButton");
    this.sliderButton = slider_button;
    this.slotHighlight = document.getElementById(ownerID + "slotHighlight");
    slider_button.owner = this;


    slider_button.addEventListener("dragstart", function () { event.dataTransfer.dropEffects = 'none'; });

    slider_button.addEventListener("mousedown", function (evt) {
        slider_button.setAttribute("fill", "#A0D0FF");
        slider_button.setAttribute("cursor", "ew-resize");
        this.isButtonMoving = true;
        evt.preventDefault();
        return false;
    });

    slider_button.addEventListener("mouseup", function () {
        this.isButtonMoving = false;
        slider_button.setAttribute("fill", "#E0F0FF");
        slider_button.setAttribute("cursor", "pointer");
        WMD3UpdateSliderHighlight(slider_button, Number(slider_button.getAttribute("cx")));
    });

    slider_button.addEventListener("mouseover", function () {
        this.isMouseOver = true;
        if (slider_button != null && !slider_button.isButtonMoving)
            slider_button.setAttribute("fill", "#E0F0FF");
    });

    slider_button.addEventListener("mouseout", function () {
        this.isMouseOver = false;
        if (!this.isButtonMoving) {
            slider_button.setAttribute("fill", "white");
            slider_button.setAttribute("cursor", "pointer");
        }
    });

    document.body.addEventListener("mousemove", function (evt) {
        if (slider_button != null && slider_button.isButtonMoving) {
            var btn_x = evt.layerX - slider_button.parentNode.getBoundingClientRect().left;
            var end_buffer = slider_button.owner.width / 100;
            var min_val = d3.min(slider_button.owner.scale.domain());
            var max_val = d3.max(slider_button.owner.scale.domain());

            if (!isNaN(btn_x) && btn_x > slider_button.owner.margin.left - end_buffer && btn_x < Number(slider_button.parentNode.getAttribute("width")) - slider_button.owner.margin.right + end_buffer) {
                slider_button.setAttribute("cx", btn_x);
                var new_val = slider_button.owner.getValue();
                if (new_val > max_val)
                    new_val = max_val;
                else {
                    if (new_val < min_val)
                        new_val = min_val;
                }

                if (slider_button.owner.onValueChanged != null)
                    slider_button.owner.onValueChanged(evt);

                for (var i = 0; i < slider_button.owner.linkedControls.length; ++i) {
                    var formatted_value;
                    if (slider_button.owner.linkedControls[i].onchange != null) {
                        formatBuffer.onchange = slider_button.owner.linkedControls[i].onchange;
                        formatBuffer.value = new_val.toString();
                        formatBuffer.onchange();
                        formatted_value = formatBuffer.value;
                    }
                    else {
                        if (isNaN(new_val))
                            formatted_value = new_val.toString();
                        else
                            formatted_value = new_val.toFixed(2).toString();
                    }
                    slider_button.owner.linkedControls[i].value = formatted_value;

                    if (slider_button.owner.linkedControls[i].onchange != null)
                        slider_button.owner.linkedControls[i].onchange();
                }
            }
        }
    });

    document.body.addEventListener("mouseup", function () {
        if (slider_button.isButtonMoving != null && slider_button.isButtonMoving) {
            slider_button.isButtonMoving = false;
            slider_button.setAttribute("cursor", "pointer");
            if (slider_button.isMouseOver != null && slider_button.isMouseOver)
                slider_button.setAttribute("fill", "#E0F0FF");
            else
                slider_button.setAttribute("fill", "white");

            WMD3UpdateSliderHighlight(slider_button, Number(slider_button.getAttribute("cx")));
        }
    });

    this.linkedControlChangeHandler = function (ctl) {
        var new_val = Number(ctl.value);
        if (!isNaN(new_val)) {
            this.setValue(new_val);

            for (var i = 0; i < this.linkedControls.length; ++i) {
                if (this.linkedControls[i] != ctl)
                    this.linkedControls[i].value = new_val;
            }
        }
    }
}

function WMD3GetSliderValue() {
    return this.scale.invert(Number(this.sliderButton.getAttribute("cx")) - this.margin.left);
}

function WMD3SetSliderValue(val) {
    var bounded_val;

    var max = d3.max(this.scale.domain());
    if (val > max)
        bounded_val = max;
    else {
        var min = d3.min(this.scale.domain());
        if (val < min)
            bounded_val = min;
        else
            bounded_val = val;
    }
    var scaled_value = this.scale(bounded_val) + this.margin.left;
    this.sliderButton.setAttribute("cx", scaled_value);
    WMD3UpdateSliderHighlight(this.sliderButton, scaled_value);
}

function WMD3LinkSliderToInput(linkedElem) {

    var linkedControl;

    if (typeof (linkedElem) == "string")
        linkedControl = document.getElementById(linkedElem);
    else
        linkedControl = linkedElem;

    if (linkedControl == null)
        return;

    var slider = this;
    linkedControl.addEventListener("change", function () { slider.linkedControlChangeHandler(linkedControl); });
    this.linkedControls.push(linkedControl);
}

function WMD3CreateSliderScale(scaleDomain, axisTicks, axisTickFormat) {
    if (scaleDomain != null && scaleDomain.length > 0 && scaleDomain[0] != null) {
        if (!isNaN(Date.parse(scaleDomain[0].toString()))) {
            this.scaleType = "DateTime";
            this.scale = d3.time.scale().domain(scaleDomain).range([0, this.width]);
        }

        else {
            if (!isNaN(Number(scaleDomain[0]))) {
                this.scaleType = "Linear";
                this.scale = d3.scale.linear().domain([d3.min(scaleDomain), d3.max(scaleDomain)]);
                this.scale.range([0, this.width]);
            }

            else {
                this.scaleType = "Ordinal";
                this.scale = d3.scale.ordinal().domain(scaleDomain).range([0, this.width]);
            }
        }
    }

    this.scaleAxis = d3.svg.axis()
                .scale(this.scale)
                .tickSize(-this.height, 0, 0)
                .orient("bottom");

    if (axisTicks != null)
        this.scaleAxis.ticks(axisTicks[0], axisTicks[1]);
    if (axisTickFormat != null)
        this.scaleAxis.tickFormat(axisTickFormat);

    var selection = d3.select('#' + this.owner.id);
    var x_axis_svg = selection.append("g")
                  .attr("id", this.owner.id + "scale")
                  .attr("class", this.scaleClassName)
                  .attr("transform", "translate(" + this.margin.left + "," + (Number(this.height) + Number(this.margin.top) - Number(this.margin.bottom)) + ")")
                  .call(this.scaleAxis);

    if (this.scaleLabelRotation != 0) {

        var offset = this.scale.rangeBand() / 2;
        x_axis_svg.selectAll("text")
                  .style("text-anchor", "end")
                  .attr("transform", "rotate(" + this.scaleLabelRotation + "),translate(-10, -" + offset + ")");
    }
}

function WMD3UpdateSliderHighlight(s, x) {
    var s_height = s.owner.height;
    s.owner.slotHighlight.setAttribute("d", " M " + (s.owner.margin.left).toString() + "," + (s_height / 2 - s.owner.slotWidth / 2).toString() +
                             " A " + (s.owner.slotWidth / 2).toString() + "," + (s.owner.slotWidth / 2).toString() + " 0 0 0 " +
                              (s.owner.margin.left).toString() + "," + (s_height / 2 + s.owner.slotWidth / 2).toString() +
                             " L " + x.toString() + "," + (s_height / 2 + s.owner.slotWidth / 2).toString() +
                             " A " + (s.owner.slotWidth / 2).toString() + "," + (s.owner.slotWidth / 2).toString() + " 0 0 0 " +
                               x.toString() + "," + (s_height / 2 - s.owner.slotWidth / 2).toString() +
                             " Z");
}

function WMD3SetSliderRange(range, axisTicks, axisTickFormat) {

    d3.select("#" + this.owner.id + "scale").remove();
    this.createSliderScale(range, axisTicks, axisTickFormat);

    var slider_button = document.getElementById(this.owner.id + "sliderButton");
    this.owner.removeChild(slider_button);
    this.owner.appendChild(slider_button);
}


function WMD3Gauge(ownerID, radius, angle, value, maxVal, params) {
    this.radius = radius;
    this.angle = angle;
    this.maxValue = maxVal;
    this.value = (value == null) ? 0 : value;
    this.showAsPercentage = (params != null && params.showAsPercentage != null) ? params.showAsPercentage : true;
    this.strokeWidth = (params != null && params.strokeWidth != null) ? params.strokeWidth : 15;
    this.stroke = (params != null && params.stroke != null) ? params.stroke : "red";
    this.fontSize = (params != null && params.fontSize != null) ? params.fontSize : radius * 1.25;

    this.linkTo = WMD3LinkGaugeTo;
    this.setValue = WMD3SetGaugeValue;
    this.setGaugeColor = function (color) { this.stroke = color; this.arc.setAttribute("stroke", this.stroke); };

    this.sinAngle2 = Math.sin(angle / 2);
    this.cosAngle2 = Math.cos(angle / 2);


    this.arc = document.createElementNS(svgNS, "path");
    this.arc.setAttribute("stroke", this.stroke);
    this.arc.setAttribute("stroke-width", this.strokeWidth);
    this.arc.setAttribute("stroke-linecap", "round");
    this.arc.setAttribute("fill", "none");

    this.valueText = document.createElementNS(svgNS, "text");
    this.valueText.setAttribute("style", "font-size:" + this.radius * 1.0 + "px; text-anchor:middle; font-family:Segoe UI Light");
    this.valueText.setAttribute("fill", "Gray");
    this.valueText.setAttribute("x", this.radius + this.strokeWidth);
    this.valueText.setAttribute("y", this.radius * (2.25 - this.sinAngle2));



    this.owner = document.getElementById(ownerID);
    this.owner.appendChild(this.arc);
    this.owner.appendChild(this.valueText);



    this.setValue(value);

}


function WMD3LinkGaugeTo(ctrl) {
    ctrl.onchange = function () { this.setValue(Number(ctrl.value)); };
}

function WMD3SetGaugeValue(val) {
    this.value = val;
    var arcAngle = val / this.maxValue * (2 * Math.PI - this.angle) + this.angle / 2;
    var arcEndX = this.radius * (1 - Math.sin(arcAngle)) + this.strokeWidth;
    var arcEndY = this.radius * (2 - this.cosAngle2 + Math.cos(arcAngle));
    var isMajorArc = this.value > this.maxValue / 2 ? 1 : 0;

    this.valueText.textContent = val.toString();

    this.arc.setAttribute("d", "M " + (this.radius * (1 - this.sinAngle2) + this.strokeWidth) + " ," + 2 * this.radius + " " +
                               "A " + this.radius + "," + this.radius + " " +
                                    +0 + " " + isMajorArc + " " + 1 + " " + arcEndX + "," + arcEndY);



}

function WMD3Slider(ownerID, params) {

    this.createSliderScale = WMD3CreateSliderScale;
    this.setSliderRange = WMD3SetSliderRange;
    this.linkTo = WMD3LinkSliderToInput;
    this.getValue = WMD3GetSliderValue;
    this.setValue = WMD3SetSliderValue;

    this.linkedControls =  new Array();

    this.owner = document.getElementById(ownerID);

    var owner_rect = this.owner.getBoundingClientRect();

    this.margin = (params != null && params.margin != null) ? params.margin : { top: 0, right: 15, bottom: 5, left: 15 };
    this.width = owner_rect.width - this.margin.left - this.margin.right;
    this.height = owner_rect.height - this.margin.top - this.margin.bottom;
    this.slotWidth = (params != null && params.slotWidth != null) ? params.slotWidth : 5;
    this.scaleClassName = (params != null && params.scaleClassName != null) ? params.scaleClassName : "WMSliderScale";
    this.scaleLabelRotation = (params != null && params.scaleLabelRotation != null) ? params.scaleLabelRotation : "0";
    this.scaleCaption = (params != null && params.scaleCaption != null) ? params.scaleCaption : "";

    var scaleDomain = (params == null || params.domain == null) ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : params.domain;
    this.createSliderScale(scaleDomain);
    var selection = d3.select('#' + this.owner.id);

    selection.append("text")
                  .attr("y", this.height)
                  .attr("x", this.width)
                  .attr("dy", this.margin.top + this.margin.bottom)
                  .style("text-anchor", "end bottom")
                  .text(this.scaleCaption);

    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " L " + (this.width + this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() + 
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.width + this.margin.left + this.slotWidth / 2).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " Z")
                  .attr("class", this.scaleClassName)
                  .attr("fill", "#C0C0C0")
                  .attr("stroke", "#A0A0A0")
                  .attr("stroke-width", 1);



    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 1 " +
                              (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " L " + (this.width + this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() )// +
                             //" A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 1 " +
                             //(this.width - this.margin.right + this.slotWidth/2).toString() + "," + (this.height / 2).toString())
                  .attr("class", this.scaleClassName)
                  .attr("fill", "none")
                  .attr("stroke", "black")
                  .attr("storke-thickness", 1);

    selection.append("path")
                  .attr("d", " M " + (this.margin.left).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.margin.left).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " L " + (this.width / 2).toString() + "," + (this.height / 2 + this.slotWidth / 2).toString() +
                             " A " + (this.slotWidth / 2).toString() + "," + (this.slotWidth / 2).toString() + " 0 0 0 " +
                              (this.width / 2).toString() + "," + (this.height / 2 - this.slotWidth / 2).toString() +
                             " Z")
                  .attr("class", this.scaleClassName)
                  .attr("fill", "#E0F0FF")
                  .attr("stroke", "none")
                  .attr("stroke-width", 0)
                  .attr("id", ownerID + "slotHighlight");

    selection.append("circle")
                   .attr("cx", this.width / 2)
                   .attr("cy", this.height / 2)
                   .attr("r", 10)
                   .attr("fill", "white")
                   .attr("stroke", "Gray")
                   .attr("stroke-thickness", 1)
                   .attr("cursor", "pointer")
                   .attr("draggable", "false")
                   .attr("id", ownerID + "sliderButton");

    var slider_button = document.getElementById(ownerID + "sliderButton");
    this.sliderButton = slider_button;
    this.slotHighlight = document.getElementById(ownerID + "slotHighlight");
    slider_button.owner = this;


    slider_button.addEventListener("dragstart", function () { event.dataTransfer.dropEffects = 'none'; });

    slider_button.addEventListener("mousedown", function (evt) {
        slider_button.setAttribute("fill", "#A0D0FF");
        slider_button.setAttribute("cursor", "ew-resize");
        this.isButtonMoving = true;
        evt.preventDefault();
        return false;
    });

    slider_button.addEventListener("mouseup", function () {
        this.isButtonMoving = false;
        slider_button.setAttribute("fill", "#E0F0FF");
        slider_button.setAttribute("cursor", "pointer");
        WMD3UpdateSliderHighlight(slider_button, Number(slider_button.getAttribute("cx")));
    });

    slider_button.addEventListener("mouseover", function () {
        this.isMouseOver = true;
        if (slider_button != null && !slider_button.isButtonMoving)
            slider_button.setAttribute("fill", "#E0F0FF");
    });

    slider_button.addEventListener("mouseout", function () {
        this.isMouseOver = false;
        if (!this.isButtonMoving) {
            slider_button.setAttribute("fill", "white");
            slider_button.setAttribute("cursor", "pointer");
        }
    });

    document.body.addEventListener("mousemove", function (evt) {
        if (slider_button != null && slider_button.isButtonMoving) {
            var btn_x = evt.layerX - slider_button.parentNode.getBoundingClientRect().left;
            var end_buffer = slider_button.owner.width / 100;
            var min_val = d3.min(slider_button.owner.scale.domain());
            var max_val = d3.max(slider_button.owner.scale.domain());

            if (!isNaN(btn_x) && btn_x > slider_button.owner.margin.left - end_buffer && btn_x < Number(slider_button.parentNode.getAttribute("width")) - slider_button.owner.margin.right + end_buffer) {
                slider_button.setAttribute("cx", btn_x);
                var new_val = slider_button.owner.getValue();
                if (new_val > max_val)
                    new_val = max_val;
                else {
                    if (new_val < min_val)
                        new_val = min_val;
                }
                for (var i = 0; i < slider_button.owner.linkedControls.length; ++i) {
                    var linked_ctl = slider_button.owner.linkedControls[i];
                    linked_ctl.value = sprintf("%.2f", new_val);
                }
            }
        }
    });

    document.body.addEventListener("mouseup", function () {
        if (slider_button.isButtonMoving != null && slider_button.isButtonMoving) {
            slider_button.isButtonMoving = false;
            slider_button.setAttribute("cursor", "pointer");
            if (slider_button.isMouseOver != null && slider_button.isMouseOver) 
                slider_button.setAttribute("fill", "#E0F0FF");
            else
                slider_button.setAttribute("fill", "white");

            WMD3UpdateSliderHighlight(slider_button, Number(slider_button.getAttribute("cx")));
        }
    });

    this.linkedControlChangeHandler = function (ctl) {
        var new_val = Number(ctl.value);
        if (!isNaN(new_val)) {
            this.setValue(new_val);

            for (var i = 0; i < this.linkedControls.length; ++i) {
                if (this.linkedControls[i] != ctl)
                    this.linkedControls[i].value = new_val;
            }
        }
    }
}

function WMD3GetSliderValue() {
    return this.scale.invert(Number(this.sliderButton.getAttribute("cx")) - this.margin.left);
}

function WMD3SetSliderValue(val) {
    var bounded_val;

    var max = d3.max(this.scale.domain());
    if (val > max)
        bounded_val = max;
    else
    {
        var min = d3.min(this.scale.domain());
        if (val < min)
            bounded_val = min;
        else
            bounded_val = val;
    }
    var scaled_value = this.scale(bounded_val) + this.margin.left;
    this.sliderButton.setAttribute("cx", scaled_value);
    WMD3UpdateSliderHighlight(this.sliderButton, scaled_value);
}

function WMD3LinkSliderToInput(linkedElem) {

    var linkedControl;

    if (typeof (linkedElem) == "string")
        linkedControl = document.getElementById(linkedElem);
    else
        linkedControl = linkedElem;

    var slider = this;
    linkedControl.addEventListener("change", function () { slider.linkedControlChangeHandler(linkedControl); });
    this.linkedControls.push(linkedControl);

    linkedControl.value = sprintf("%.2f", this.getValue());
}

function WMD3CreateSliderScale(scaleDomain)
{
    if (scaleDomain != null && scaleDomain.length > 0 && scaleDomain[0] != null) {
        if (!isNaN(Date.parse(scaleDomain[0].toString()))) {
            this.scaleType = "DateTime";
            this.scale = d3.time.scale().domain(scaleDomain).range(0, this.width);
        }

        else {
            if (!isNaN(Number(scaleDomain[0]))) {
                this.scaleType = "Linear";
                this.scale = d3.scale.linear().domain([d3.min(scaleDomain), d3.max(scaleDomain)]);
                this.scale.range([0, this.width]);
            }

            else {
                this.scaleType = "Ordinal";
                this.scale = d3.scale.ordinal().domain(scaleDomain).range(0, this.width);
            }
        }        
    }

    this.scaleAxis = d3.svg.axis()
                .scale(this.scale)
                .tickSize(-this.height, 0, 0)
                .orient("bottom");
    
    var selection = d3.select('#' + this.owner.id);
    var x_axis_svg = selection.append("g")
                  .attr("id", this.owner.id + "scale")
                  .attr("class", this.scaleClassName)
                  .attr("transform", "translate(" + this.margin.left +"," + (Number(this.height) + Number(this.margin.top) - Number(this.margin.bottom)) + ")")
                  .call(this.scaleAxis);

    if (this.scaleLabelRotation != 0) {

        var offset = this.scale.rangeBand() / 2;
        x_axis_svg.selectAll("text")
                  .style("text-anchor", "end")
                  .attr("transform", "rotate(" + this.scaleLabelRotation + "),translate(-10, -" + offset + ")");
    }
}

function WMD3UpdateSliderHighlight(s, x) {
    var s_height = s.owner.height;
    s.owner.slotHighlight.setAttribute("d", " M " + (s.owner.margin.left).toString() + "," + (s_height / 2 - s.owner.slotWidth / 2).toString() +
                             " A " + (s.owner.slotWidth / 2).toString() + "," + (s.owner.slotWidth / 2).toString() + " 0 0 0 " +
                              (s.owner.margin.left).toString() + "," + (s_height / 2 + s.owner.slotWidth / 2).toString() +
                             " L " + x.toString() + "," + (s_height / 2 + s.owner.slotWidth / 2).toString() +
                             " A " + (s.owner.slotWidth / 2).toString() + "," + (s.owner.slotWidth / 2).toString() + " 0 0 0 " +
                               x.toString() + "," + (s_height / 2 - s.owner.slotWidth / 2).toString() +
                             " Z");
}

function WMD3SetSliderRange(range) {

    d3.select("#" + this.owner.id + "scale").remove();
    this.createSliderScale(range);

    var slider_button = document.getElementById(this.owner.id + "sliderButton");
    this.owner.removeChild(slider_button);
    this.owner.appendChild(slider_button);
}


/*
function WMLinePlot(plotArea) {

this.owner = plotArea.owner;
this.width = owner.width;
this.height = owner.height;
this.margin = { top: 20, right: 30, bottom: 30, left: 40 };

this.xScale = d3.scale.ordinal().rangeRoundBands([0, width-this.margin.left-this.margin.right], 1);
this.yScale = d3.sclae.linear().range([height-margin.top-margin.bottom,0]);
}

*/