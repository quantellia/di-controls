
var svgNS = "http://www.w3.org/2000/svg";
var activeHandle = null;


function pieChart(ownerID, data, params) {

    this.dataArray = data;
    this.colorArray = (params == null || params.colorArray == null) ? ['bisque', 'darksalmon', 'dodgerblue', 'palegreen', 'pink'] : params.colorArray;
    this.angleArray = new Array();
    this.sumData = 0;
    this.handleSize = (params != null && params.handleSize != null) ? params.handleSize : 10;

    this.owner = document.getElementById(ownerID);


    for (var i = 0; i < data.length; ++i)
        this.sumData = this.sumData + data[i];

    for (i = 0; i < data.length; ++i)
        this.angleArray.push(data[i] / this.sumData * 360);


    this.drawArcs = function () {
        var startAngle = 0;
        var endAngle = 0;

        var center_x = this.owner.getAttribute("width") / 2;
        var center_y = this.owner.getAttribute("height") / 2;
        var radius = Math.min(center_x - this.handleSize, center_y - this.handleSize);

        
        for (i = 0; i < this.angleArray.length; i++) {
            startAngle = endAngle;
            endAngle = startAngle + this.angleArray[i];

            x1 = parseInt(center_x + radius * Math.cos(Math.PI * startAngle / 180));
            y1 = parseInt(center_y + radius * Math.sin(Math.PI * startAngle / 180));

            x2 = parseInt(center_x + radius * Math.cos(Math.PI * endAngle / 180));
            y2 = parseInt(center_y + radius * Math.sin(Math.PI * endAngle / 180));

            var d = "M" + center_x + " " + center_y + " L" + x1 + " " + y1 + "  A " + radius + "," + radius + " 0 0 1 " + x2 + " " + y2 + " Z";


            var arc = document.createElementNS(svgNS, 'path');
            var arc_id = this.owner.id + "_arc" + i;
            arc.setAttribute('d', d);
            arc.setAttribute('stroke', '#000000');
            arc.setAttribute('stroke-width', "1");
            arc.setAttribute('fill', this.colorArray[i % this.colorArray.length]);
            arc.setAttribute('class', this.owner.id + "_PieChartArc");
            arc.id = arc_id;
            arc.pieChart = this;

            this.owner.appendChild(arc);
        }

        for (i = 0; i < this.angleArray.length; i++) {
            startAngle = endAngle;
            endAngle = startAngle + this.angleArray[i];

            x1 = parseInt(center_x + radius * Math.cos(Math.PI * startAngle / 180));
            y1 = parseInt(center_y + radius * Math.sin(Math.PI * startAngle / 180));

            x2 = parseInt(center_x + radius * Math.cos(Math.PI * endAngle / 180));
            y2 = parseInt(center_y + radius * Math.sin(Math.PI * endAngle / 180));


            //
            // Add a drag circle at x1, y1
            //
            var handle_id = this.owner.id + "_handle" + i;
            var handle = document.createElementNS(svgNS, 'circle')
            handle.setAttribute('cx', x1);
            handle.setAttribute('cy', y1);
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
    var handle_no = handleID.substring(ownerID.length + "_Handle".length);
    var arc = document.getElementById(ownerID + "_arc" + handle_no);
    var TOLERANCE = hdl.pieChart.handleSize / 2;

    var handle_x = hdl.getAttribute("cx");
    var handle_y = hdl.getAttribute("cy");

    var arc_geom = arc.getAttribute("d");
    var old_arc_geom1 = arc_geom;

    arc.setAttribute("d", arc_geom.substring(0, arc_geom.indexOf("L")) + "L " + handle_x + " " + handle_y + " " + arc_geom.substring(arc_geom.indexOf("A")));

    var arc1_index = handle_no;
    var arc1_angle = GetArcAngle(arc.getAttribute("d"));
    var arc1_value = arc1_angle % 360 / 360 * hdl.pieChart.sumData;


    var segment_count = document.getElementsByClassName(ownerID + "_PieChartArc").length;

    handle_no = (handle_no == 0) ? segment_count - 1 : handle_no - 1;
    arc = document.getElementById(ownerID + "_arc" + handle_no);
    arc_geom = arc.getAttribute("d");
    var old_arc_geom2 = arc_geom;
    arc.setAttribute("d", arc_geom.substring(0, arc_geom.indexOf("0 0 1")) + " 0 0 1 " + handle_x + " " + handle_y + " Z");

    var arc2_index = handle_no;
    var arc2_angle = GetArcAngle(arc.getAttribute("d"));
    var arc2_value = arc2_angle % 360 / 360 * hdl.pieChart.sumData;


    if (arc1_angle > TOLERANCE && arc2_angle > TOLERANCE && arc1_value < hdl.pieChart.sumData - arc1_value - arc2_value) {
        hdl.pieChart.dataArray[handle_no] = arc2_value;
        hdl.pieChart.dataArray[(handle_no + 1) % segment_count] = arc1_value;
        hdl.pieChart.angleArray[handle_no] = arc2_angle;
        hdl.pieChart.angleArray[(handle_no + 1) % segment_count] = arc1_angle;
        if (hdl.pieChart.ondatachange != null)
            hdl.pieChart.ondatachange(hdl.pieChart, [{ "index": arc1_index, "value": arc1_value }, { "index": arc2_index, "value": arc2_value}]);

        return true;
    }
    else {

        document.getElementById(ownerID + "_arc" + handle_no).setAttribute("d", old_arc_geom2);
        document.getElementById(ownerID + "_arc" + (handle_no + 1) % segment_count).setAttribute("d", old_arc_geom1);

        return false;
    }

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
            }

        }
        return false;
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

