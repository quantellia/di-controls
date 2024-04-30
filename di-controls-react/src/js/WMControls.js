

var svgNS = "http://www.w3.org/2000/svg";
var activeHandle = null;

var activeSliderPanel = null;
var activeSliderMousePos = null;
var decimalSeparator = ".";
var thousandSeparator = ",";

function SetDecimalSeparator(dsChar) { decimalSeparator = dsChar; }
function SetThousandSeparator(tChar) { thousandSeparator = tChar; }

function RenderSliderPanels() {
    document.getElementsByTagName('BODY')[0].addEventListener('mouseup', function () { activeSliderPanel = null; activeSliderMousePos = null; });

    var slider_panels = document.getElementsByClassName('WMVerticalSliderPanel');

    for (var i = 0; i < slider_panels.length; ++i) {

        slider_panels[i].addEventListener('mousemove', OnSliderMouseMove);

        var slider_frame = document.createElement('TABLE');
        var slider_frame_row = slider_frame.insertRow(0);

        var left_td = slider_frame_row.insertCell(0);
        left_td.id = slider_panels[i].id + "_leftPane";
        var slider_td = slider_frame_row.insertCell(1);
        var right_td = slider_frame_row.insertCell(2);
        right_td.id = slider_panels[i].id + "_rightPane";

        var left_pane = document.createElement('DIV');
        var right_pane = document.createElement('DIV');
        var slider = document.createElement('DIV');

        slider_frame.style.borderCollapse = 'collapse';
        slider_panels[i].onmousemove = OnSliderMouseMove;

        left_td.appendChild(left_pane);
        slider_td.appendChild(slider);
        right_td.appendChild(right_pane);

        slider_td.className = slider_panels[i].className.replace('WMVerticalSliderPanel', 'WMVerticalSliderBar');
        slider_td.onmousedown = function () { activeSliderPanel = slider_frame; activeSliderMousePos = { "X": window.event.clientX, "Y": window.event.clientY }; }

        left_pane.style.background = 'gray';
        right_pane.style.background = 'yellow';
        left_pane.style.height = '20em';
        right_pane.style.height = '20em';
        left_pane.innerHTML = 'this is the left pane';
        right_pane.innerHTML = 'this is the right pane';

        slider_panels[i].appendChild(slider_frame);
    }

    function OnSliderMouseMove(panel) {
        if (activeSliderPanel == this) {
            var left_pane = document.getElementById(this.id + "_leftPane");
            var right_pane = document.getElementById(this.id + "_rightPane");

            var left_pane_rect = left_pane.getBoundingClientRect();
            var right_pane_rect = right_pane.getBoundingClientRect();

            left_pane.style.width = Number(window.event.clientX) - Number(left_pane_rect.left) + 'px';



        }
    }

}


function WMAttachmentDropArea(ownerID) {

    this.title = 'Documents and Attachments (drop files here)';
    this.dropArea = document.createElement('DIV');
    this.dropArea.className = "WMAttachmentArea";

    var layout_table_outer = document.createElement('TABLE');
    var layout_table = document.createElement('TBODY');
    layout_table_outer.appendChild(layout_table);
    this.dropArea.appendChild(layout_table_outer);

    var header_row = document.createElement('TR');
    var header_cell = document.createElement('TD');
    header_row.appendChild(header_cell);
    header_cell.style.textAlign = 'left';

    this.header = document.createElement('DIV');
    header_cell.appendChild(this.header);

    var body_row = document.createElement('TR');
    var body_cell = document.createElement('TD');
    body_cell.style.textAlign = 'left';
    body_row.appendChild(body_cell);
    this.body = document.createElement('DIV');
    body_cell.appendChild(this.body);

    var icon = document.createElement('IMG');
    icon.src = 'WMServerBase/Images/AttachmentIcon.png';
    icon.style.height = '2em';
    header_cell.appendChild(icon);

    var title_span = document.createElement('SPAN');
    title_span.innerHTML = this.title;
    title_span.style.position = 'relative';
    title_span.style.top = '-0.33em';
    header_cell.appendChild(title_span);

    layout_table.appendChild(header_row);
    layout_table.appendChild(body_row);

    this.dropArea.ondragover = AllowDrop;
    this.dropArea.ondrop = DropAsAttachment;

    this.owner = document.getElementById(ownerID);
    this.owner.appendChild(this.dropArea);
}

function WMTabView(ownerID) {
    this.tabs = new Array();
    this.tabView = document.createElement("DIV");
    this.tabView.className = "WMTabView";

    this.tabButtonStrip = new document.createElement("DIV");
    this.tabContentArea = new document.createElement("DIV");

    this.tabView.appendChild(tabContentArea);
    this.tabView.appendChild(tabBttonStrip);

    document.getElementById(ownerID).appendChild(this.tabView);

    this.addTab = function (id, headingContent, contentID) {
        var new_tab = new WMTabItem(this, id, headingContent, contentID);
        tabs.push(new_tab);


    }
}

function WMTabItem(parentTabView, id, headingContent, contentID)
{

}


function WMCurrencyControl(ownerID, params)
{
    this.autoConvert = (params && params.autoConvert != null) ? params.autoConvert : true;
    this.propagateCurrencyChangeToGroup = (params && params.propagateCurrencyChangeToGroup != null) ? params.propagateCurrencyChangeToGroup : true;
    this.allowCurrencyChange = (params && params.allowCurrencyChange != null) ? params.allowCurrencyChange : true;
    this.allowValueChange = (params && params.allowValueChange != null) ? params.allowValueChange : true;
    this.showCurrency = (params && params.showCurrency != null) ? params.showCurrency : true;
    this.currencySelectorOnFocus = (params && params.currencySelectorOnFocus != null) ? params.currencySelectorOnFocus : true;
    var inputCSSClass = (params && params.inputCSSClass != null) ? params.inputCSSClass : null;

    this.currencySelector = document.createElement('DIV');
    this.currencyLabel = document.createElement('DIV');
    this.valueInput = document.createElement('INPUT');

    this.valueInput.style.textAlign = "right";
    this.valueInput.style.width = "100%";
    this.valueInput.id = ownerID + "_WMCurrencyControlInput";
    this.valueInput.name = this.valueInput.id;
    

    
    this.currencySelector.style.display = "none";
    this.currencySelector.style.position = "absolute";
    this.currencySelector.style.width = "170px";
    this.currencySelector.style.zIndex = '1000';
    this.currencySelector.overflow = 'hidden';
    this.currencySelector.className = "__WMCurrencyControlSelector";
    this.currencySelector.id = ownerID + "_WMCurrencyControlSelector";

    this.hiddenBuffer = document.createElement('INPUT');
    this.hiddenBuffer.setAttribute('type', 'hidden');
    this.hiddenBuffer.name = ownerID;
    this.hiddenBuffer.currencyControl = this;

    var selector_header = document.createElement('DIV');
    selector_header.className = "__WMCurrencyControlSelectorHeader";

    selector_header.innerHTML = '<div style="text-align:right;vertical-align:top;width:100%;"><span class="Close" onclick="document.getElementById(\'' + ownerID + '_WMCurrencyControlSelector\').style.display=\'none\'">&nbsp;&times;&nbsp;</span></div>' +
                        '<div class="WMLinkText" style="margin-bottom:1em;">Open Currency Manager...</div>' +
                        '<div style="margin: 0.5em 0.5em 0.5em -0.5em; border:1px solid #A0A0A0;position:relative;padding:0.8em 0.3em 0.3em 0.3em"><div style="position:absolute;top:-0.85em;background:white">&nbsp;Exchange Rate&nbsp;</div>' +
                        '<input id="' + ownerID + '_WMCurrencyControlDefaultRate" type="radio" onclick="OnRadioButtonChecked()"/> Use quoted rate <br/>' +
                        '<input id="' + ownerID + '_WMCurrencyControlOverrideRate" type="radio" onclick="OnRadioButtonChecked()"/> Specify rate '+
                        '<input id="' + ownerID + '_WMCurrencyControlRate" style="width:30%" />' +
                        '</div>';

    this.currencySelector.appendChild(selector_header);
    var selector_grid = document.createElement('DIV');
    selector_grid.id = ownerID + "_WMCurrencyControlSelectorGrid";
    selector_grid.style.width = '100%';
    
    

    var base_field = document.createElement('DIV');
    base_field.className = '_WMCurrencyControlSelectorBase';
    base_field.style.width = "99%";
    base_field.innerHTML = '<div style="margin-bottom:0.5em;">Base currency:&nbsp;' +
                            '<select id="' + ownerID + '_WMBaseCurrencyLink" ><option value="USD">USD</option></select></div>';

    this.currencySelector.appendChild(base_field);
    this.currencySelector.appendChild(selector_grid);

    this.currencyLabel.style.position = "absolute";
    this.currencyLabel.className = "__WMCurrencyControlLabel";
    this.currencyLabel.id = ownerID + "_WMCurrencyControlLabel";
    this.currencyLabel.innerHTML = 'USD';
    this.currencyLabel.style.textAlign = 'left';
    this.currencyLabel.style.marginLeft = '0.2em';

    this.currencyLabel.onclick = function () {
        var sel = document.getElementById(ownerID + "_WMCurrencyControlSelector");
        sel.style.display = 'inline';
        sel.style.top = document.getElementById(ownerID + "_WMCurrencyControlInput").getBoundingClientRect().height + 'px';
    };

    this.tooltip = document.createElement('DIV');
    this.tooltip.className = "WMTooltip";
    this.tooltip.innerHTML = 'Click currency code to show the quick-list of currencies.<br />Click <a href="">here</a> to open the <a href="">Currencies Manager</a>.'; 1
    this.tooltip.style.width = '25em';
    this.currencyLabel.appendChild(this.tooltip);

    Object.defineProperty(this, 
                          "value", 
                          {
                            get: function(){ return this.valueInput.value; },
                            set: function(val) { this.valueInput.value = val; }
                          });
    
    
    this.owner = document.getElementById(ownerID);
    var ctrl_div = document.createElement('DIV');
    ctrl_div.className = "__WMCurrencyControlInput" + ((inputCSSClass != null) ? (" " + inputCSSClass) : "");
    var input_div = document.createElement('DIV');
    input_div.style.position = 'relative';
    ctrl_div.style.verticalAlign = 'middle';
    ctrl_div.appendChild(this.currencySelector);
    ctrl_div.appendChild(input_div);
    ctrl_div.appendChild(this.hiddenBuffer);
    input_div.appendChild(this.currencyLabel);
    input_div.appendChild(this.valueInput);
    this.owner.appendChild(ctrl_div);

    var val_rect = this.valueInput.getBoundingClientRect();
    var div_rect = input_div.getBoundingClientRect();
    var label_offset_x = val_rect.left - div_rect.left;
    var label_offset_y = val_rect.top - div_rect.top + (val_rect.height - this.currencyLabel.getBoundingClientRect().height)/2;

    this.currencyLabel.style.left = label_offset_x + 'px';
    this.currencyLabel.style.top = label_offset_y + 'px';
    this.currencyLabel.style.zIndex = '100';


    this.selectorGrid = new dhtmlXGridObject(ownerID + "_WMCurrencyControlSelectorGrid");
    this.selectorGrid.setImagePath(WMapplicationRoot + "WMServerBase/Controls/Grid/codebase/imgs/");
    this.selectorGrid.setHeader("Currency,Rate", null, ["text-align:center", "text-align:center"]); //the headers of columns
    this.selectorGrid.setInitWidths("85,82");          //the widths of columns          
    this.selectorGrid.setColAlign("left,left");       //the alignment of columns           
    this.selectorGrid.setColTypes("ro,ro");                //the types of columns          
    this.selectorGrid.setColSorting("str,int");          //the sorting types           
    this.selectorGrid.enableTooltips("false,false");
    this.selectorGrid.setStyle("padding: 0.25em 0em 0.25em 0em;", "padding:0px 0px 0px 0px;text-align:center", "", "");

    var data = { rows:
                                [
                                    { id: 1, data: ["USD", "1.000"] },
                                    { id: 2, data: ["AUD", "1.413"] },
                                    { id: 3, data: ["GBP", "0.786"] },
                                    { id: 4, data: ["EUR", "0.896"] },
                                    { id: 5, data: ["CAD", "1.399"] }
                                ]
    }


    this.selectorGrid.init();
    this.selectorGrid.parse(data, "json");

    this.selectorGrid.attachEvent("onRowSelect",
                                    function (rowID, celInd) {
                                        var grid = this;

                                        document.getElementById(ownerID + "_WMCurrencyControlLabel").innerHTML = grid.cellById(rowID, 0).cell.textContent;
                                        document.getElementById(ownerID + "_WMCurrencyControlSelector").style.display = 'none';
                                    });
    
    this.setCurrency = function(cur){};
    this.getCurrency = function() {};

    this.setValue = function (val) {
        if (val == 'UPDATE_FROM_BUFFER') {

            document.getElementById(this.hiddenBuffer.name + "_message").innerHTML = "";

            var currency_data;
            if (this.hiddenBuffer.value != null && this.hiddenBuffer.value.length > 0) {
                try {
                    currency_data = JSON.parse(this.hiddenBuffer.value);
                }
                catch (ex) {
                    try {
                        if (isNaN(this.hiddenBuffer.value))
                            currency_data = Number(this.hiddenBuffer.value.trim().replace(" ", "").replace(new RegExp(thousandSeparator, "g"), ""));
                    }
                    catch (ex2) { }
                }
            }
            if (currency_data == null)
                currency_data = { "value": 0, "currency": "", "rate": 0, "overrideRate": false };


            if (isNaN(currency_data) && isNaN(currency_data.value)) {
                currency_data = "";
                document.getElementById(this.hiddenBuffer.name + "_message").innerHTML = "Please enter a valid currency amount";
            }


            this.isUpdating = true;

            this.valueInput.value = (currency_data.value != null) ? currency_data.value : currency_data.toString();
            if (currency_data.overrideRate != false)
                document.getElementById(this.owner.id + "_WMCurrencyControlOverrideRate").checked = true;
            else
                document.getElementById(this.owner.id + "_WMCurrencyControlDefaultRate").checked = true;

            this.isUpdating = false;

        }
    };

    this.getValue = function () { };

    this.InternalChangeHandler = function () {

        var wm_index = this.id.indexOf('_WMCurrencyControl');
        var cur_buffer = (wm_index == -1) ? this : document.getElementsByName(this.id.substring(0, wm_index))[0];
        var cur_label = document.getElementById(cur_buffer.name + '_WMCurrencyControlLabel');
        var cur_ovr = document.getElementById(cur_buffer.name + '_WMCurrencyControlOverrideRate');
        var cur_rate = document.getElementById(cur_buffer.name + '_WMCurrencyControlRate');
        var cur_value = document.getElementById(cur_buffer.name + '_WMCurrencyControlInput');
        var cur_symbol = (cur_label.innerHTML.indexOf('<') == -1) ? cur_label.innerHTML : cur_label.innerHTML.substring(0, cur_label.innerHTML.indexOf('<'));

        cur_buffer.value = '{"currency":"' + cur_symbol.trim() + '", ' +
                                    '"rate":' + ((cur_ovr.checked != false) ? cur_rate.value : null) + ', ' +
                                    '"overrideRate":' + cur_ovr.checked.toString() + ',' +
                                    '"value":' + cur_value.value + '}';

    };

    this.hiddenBuffer.onupdate = function () { this.currencyControl.setValue('UPDATE_FROM_BUFFER'); };
    document.getElementById(ownerID + "_WMCurrencyControlInput").addEventListener("change", this.InternalChangeHandler);

}




function pieChart(ownerID, data, params) {

    this.dataArray = data;
    this.colorArray = (params == null || params.colorArray == null) ? ['bisque', 'darksalmon', 'dodgerblue', 'palegreen', 'pink'] : params.colorArray;
    this.angleArray = new Array();
    this.sumData = 0;
    this.handleSize = (params != null && params.handleSize != null) ? params.handleSize : 10;
    this.reproportion = (params != null && params.reproportion != null) ? params.reproportion : "adjacent";

    this.owner = document.getElementById(ownerID);


    for (var i = 0; i < data.length; ++i)
        this.sumData = this.sumData + data[i];

    for (var i = 0; i < data.length; ++i)
        this.angleArray.push(data[i] / this.sumData * 360);


    this.drawArcs = function (startIndex, pieStartAngle, updateOnly) {
        startIndex = (startIndex == null) ? 0 : startIndex;
        startAngle = (pieStartAngle == null) ? 0 : pieStartAngle;
        endAngle = startAngle;
        updateOnly = (updateOnly == null) ? false : updateOnly;


        var center_x = this.owner.getAttribute("width") / 2;
        var center_y = this.owner.getAttribute("height") / 2;
        var radius = Math.min(center_x - this.handleSize, center_y - this.handleSize);


        for (var j = 0; j < this.angleArray.length; j++) {
            var i = (startIndex + j) % this.dataArray.length;

            startAngle = endAngle;
            endAngle = startAngle + this.angleArray[i];

            x1 = Number(center_x + radius * Math.cos(Math.PI * startAngle / 180));
            y1 = Number(center_y + radius * Math.sin(Math.PI * startAngle / 180));

            x2 = Number(center_x + radius * Math.cos(Math.PI * endAngle / 180));
            y2 = Number(center_y + radius * Math.sin(Math.PI * endAngle / 180));

            var d = "M" + center_x + " " + center_y + " L" + x1 + " " + y1 + "  A " + radius + "," + radius + " 0 0 1 " + x2 + " " + y2 + " Z";


            var arc;

            if (updateOnly)
                arc = document.getElementById(this.owner.id + "_arc" + i);
            else {
                arc = document.createElementNS(svgNS, 'path');
                var arc_id = this.owner.id + "_arc" + i;
                arc.setAttribute('stroke', '#000000');
                arc.setAttribute('stroke-width', "1");
                arc.setAttribute('fill', this.colorArray[i % this.colorArray.length]);
                arc.setAttribute('class', this.owner.id + "_PieChartArc");
                arc.id = arc_id;
                arc.pieChart = this;

                this.owner.appendChild(arc);
            }
            arc.setAttribute('d', d);
        }

        startAngle = (pieStartAngle == null) ? 0 : pieStartAngle;
        endAngle = startAngle;

        for (var j = 0; j < this.angleArray.length; j++) {
            var i = (startIndex + j) % this.angleArray.length;

            startAngle = endAngle;
            endAngle = startAngle + this.angleArray[i];

            x1 = Number(center_x + radius * Math.cos(Math.PI * startAngle / 180));
            y1 = Number(center_y + radius * Math.sin(Math.PI * startAngle / 180));

            x2 = Number(center_x + radius * Math.cos(Math.PI * endAngle / 180));
            y2 = Number(center_y + radius * Math.sin(Math.PI * endAngle / 180));


            //
            // Add a drag circle at x1, y1
            //
            var handle = null;
            var handle_id = this.owner.id + "_handle" + i;
            if (updateOnly)
                handle = document.getElementById(handle_id);
            else {
                handle = document.createElementNS(svgNS, 'circle')
                handle.setAttribute('r', this.handleSize);
                handle.setAttribute('stroke', 'black');
                handle.setAttribute('fill', this.colorArray[i % this.colorArray.length]);
                handle.style.cursor = "pointer";
                handle.id = handle_id;
                handle.pieChart = this;
                handle.ondragstart = function (evt) { evt.preventDefault(); return false; };
                this.owner.appendChild(handle);

                handle.onmousedown = function () {
                    if (activeHandle == null) {
                        activeHandle = this;
                        this.setAttribute("stroke", "red");
                    }
                };
            }

            handle.setAttribute('cx', x1);
            handle.setAttribute('cy', y1);

        }
    };

    this.getAngleArrayEdgeAngle = function (arcIndex) {
        var angle_sum = 0;
        for (var i = 0; i < arcIndex; ++i)
            angle_sum = angle_sum + this.angleArray[i];

        return angle_sum;
    };

    this.drawArcs();

}



function UpdateArcs(handleID) {
    var ownerID = document.getElementById(handleID).parentNode.id;
    var hdl = document.getElementById(handleID);
    var pC = hdl.pieChart;
    var handle_no = Number(handleID.substring(ownerID.length + "_Handle".length));
    var arc = document.getElementById(ownerID + "_arc" + handle_no);
    var TOLERANCE = 2 * pC.handleSize;

    var handle_x = hdl.getAttribute("cx");
    var handle_y = hdl.getAttribute("cy");

    var center_x = pC.owner.getAttribute("width") / 2;
    var center_y = pC.owner.getAttribute("height") / 2;

    var radius = Math.sqrt(Math.pow((handle_x - center_x), 2) + Math.pow((handle_y - center_y), 2));

    var arc_geom = arc.getAttribute("d");
    var old_arc_geom1 = arc_geom;

    var arc1_index = handle_no;
    var arc1_angle = GetArcAngle(arc_geom.substring(0, arc_geom.indexOf("L")) + "L " + handle_x + " " + handle_y + " " + arc_geom.substring(arc_geom.indexOf("A")));
    var arc1_value = arc1_angle % 360 / 360 * pC.sumData;

    
    var edge_angle = Math.atan2(handle_y - center_y, handle_x - center_x) * 180 / Math.PI;
    
    var segment_count = pC.dataArray.length;
    var reproportion_count;
    var prev_handle = (handle_no == 0) ? segment_count - 1 : handle_no - 1;
    if (pC.reproportion == "adjacent") {
        reproportion_count = 2;
        var repro_arcs_sum = pC.dataArray[handle_no] + pC.dataArray[prev_handle];

        if (Math.min(arc1_value, repro_arcs_sum - arc1_value) / pC.sumData < TOLERANCE / (2 * Math.PI * radius))
            return false;

        pC.dataArray[handle_no] = arc1_value;
        pC.dataArray[prev_handle] = repro_arcs_sum - arc1_value;
    }
    else {
        reproportion_count = segment_count;
        var sum_ratio = (pC.sumData - arc1_value) / (pC.sumData - pC.dataArray[handle_no]);

        for (var j = 0; j < reproportion_count; ++j) {
            var i = (handle_no + j) % segment_count;

            if (j == 0)
                pC.dataArray[handle_no] = arc1_value;

            else
                pC.dataArray[i % segment_count] = pC.dataArray[i % segment_count] * sum_ratio;
        }
    }

    for (var i = 0; i < hdl.pieChart.dataArray.length; ++i)
        pC.angleArray[i] = (pC.dataArray[i] / pC.sumData * 360);

    pC.drawArcs(handle_no, edge_angle, true);

    if (pC.ondatachange != null)
    {
        if (pC.reproportion == "adjacent")
            pC.ondatachange(pC, [{ "index": prev_handle, "value": pC.dataArray[prev_handle] }, { "index": handle_no, "value": pC.dataArray[handle_no]}]);

        else {
            var updateDataArray = new Array();

            for (var i = 0; i < pC.dataArray.length; ++i)
                updateDataArray.push({ "index": i, "value": pC.dataArray[i] });

            pC.ondatachange(pC, updateDataArray);
        }
    }


    return true;
}

function GetArcAngle(pathGeom) {
    var center = /M.*L/i.exec(pathGeom).toString();
    var center_xy = center.substring(1, center.length - 2).trim().split(" ");
    var center_x = Number(center_xy[0]);
    var center_y = Number(center_xy[1]);

    var p1 = /L.*A/i.exec(pathGeom).toString();
    var p1_xy = p1.substring(1, p1.length - 2).trim().split(" ");
    var p1_x = Number(p1_xy[0]);
    var p1_y = Number(p1_xy[1]);

    var p2 = pathGeom.substring(pathGeom.indexOf("0 0 1 ") + 6, pathGeom.length - 2).trim().toString();
    var p2_xy = p2.split(" ");
    var p2_x = Number(p2_xy[0]);
    var p2_y = Number(p2_xy[1]);

    var dx_1 = p1_x - center_x;
    var dy_1 = p1_y - center_y;
    var dx_2 = p2_x - center_x;
    var dy_2 = p2_y - center_y;

    var angle_1 = Math.atan2(dy_1, dx_1);
    var angle_2 = Math.atan2(dy_2, dx_2);

    if (angle_1 < 0 && angle_2 < 0)
        angle_1 = 2 * Math.PI + angle_1;
    if (angle_2 < 0)
        angle_2 = 2 * Math.PI + angle_2;

    return ((angle_2 - angle_1) * 180 / Math.PI) % 360;
}

(function () {
    window.addEventListener('mousemove', function (evt) {
        if (activeHandle != null) {
            evt.preventDefault();
            var owner_svg = activeHandle.parentNode;
            var owner_center_x = owner_svg.getAttribute("width") / 2;
            var owner_center_y = owner_svg.getAttribute("height") / 2;
            var radius = Math.min(owner_center_x, owner_center_y) - activeHandle.getAttribute("r");
            var owner_rect = owner_svg.getBoundingClientRect();
            var owner_x = evt.clientX - owner_rect.left;
            var owner_y = evt.clientY - owner_rect.top;

            var handle_angle = Math.atan2((owner_y - owner_center_y), (owner_x - owner_center_x));

            var old_x = activeHandle.getAttribute('cx');
            var old_y = activeHandle.getAttribute('cy');

            activeHandle.setAttribute('cx', owner_center_x + radius * Math.cos(handle_angle));
            activeHandle.setAttribute('cy', owner_center_y + radius * Math.sin(handle_angle));

            if (!UpdateArcs(activeHandle.id)) {
                activeHandle.setAttribute('cx', old_x);
                activeHandle.setAttribute('cy', old_y);

                return false
            }

        }
        return true;
    }
        );
}
    )();

(function () {
    window.addEventListener('mouseup', function (evt) {
        if (activeHandle != null) {
            evt.preventDefault();
            activeHandle.setAttribute("stroke", "black");
            activeHandle = null;
        }

        return false;
    });
})();

