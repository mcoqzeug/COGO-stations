d3.json("stations.json", function(error, data) {
    if (error) throw error;

    // draw the radio list
    function draw_list(options_list) {
        // get distinct values of search_opt from data
        // dynamically create radio button with none selected
        let radio_string = "";
        for (let i = 0; i < options_list.length; i++) {
            radio_string += "<input type='radio' id='" + options_list[i] ;
            radio_string += "' name='options' value='" + options_list[i] + "' checked='checked'";
            radio_string += "'><label for='" + options_list[i] + "'>" + options_list[i];
            radio_string += "</label>&nbsp;&nbsp;";
        }

        document.getElementById('list_radio').innerHTML = radio_string;

        // set the on_change event to redraw charts whenever a checkbox option is selected
        d3.selectAll('input[name="options"]')
            .on('change', function() {
                svg.selectAll("*").remove();  // remove old bars
                draw_bars("BIKESHARE_ID", options_selected());  // draw new bars

                d3.selectAll(".pin").remove();// remove old pins
                new_draw_map(data);  // TODO draw new map or only draw the pins

                d3.select("#conclusion").selectAll("div").remove();  // remove old conclusion
                write_conclusion();  // add new conclusion
        })
    }

    // find the option selected in the radio list
    function options_selected() {
        // looks at dynamically drawn options and adds any 'checked' values to the list
        let checked = document.querySelectorAll('input[name="options"]:checked');
        checked = Array.prototype.slice.call(checked);

        return checked[0].id
    }

    // pick color for bar chart
    function pick_color(value, y_value) {
        if (y_value === "INCOME") {
            if (value < 20000) {
                return "#99CCFF"
            } else if (value < 40000) {
                return "#649EE2"
            } else if (value < 60000) {
                return "#3674CE"
            } else if (value < 80000) {
                return "#2E619E"
            } else return "#193556"
        } else if (y_value === "POPULATION") {
            if (value < 1000) {
                return "#E3C7F2"
            } else if (value < 2000) {
                return "#D786EA"
            } else if (value < 3000) {
                return "#B237CC"
            } else if (value < 4000) {
                return "#75198C"
            } else return "#491E54"
        }
    }

    // pick the markers on the map
    function pick_img(value, y_value) {
        if (y_value === "INCOME") {
            if (value < 20000) {
                return "img/0_20.png"
            } else if (value < 40000) {
                return "img/20_40.png"
            } else if (value < 60000) {
                return "img/40_60.png"
            } else if (value < 80000) {
                return "img/60_80.png"
            } else return "img/80+.png"
        } else if (y_value === "POPULATION") {
            if (value < 1000) {
                return "img/0_1.png"
            } else if (value < 2000) {
                return "img/1_2.png"
            } else if (value < 3000) {
                return "img/2_3.png"
            } else if (value < 4000) {
                return "img/3_4.png"
            } else return "img/4+.png"
        }
    }

    function mouse_over(d, y_value) {
        let t_text = d["SITE_NAME"];
        let t_value = y_value + ": " + "<br>" + d[y_value];

        tooltipUp.html(t_text);
        tooltipDown.html(t_value);
        tooltipSymbol.html("<img class=\"dolorImg\" src=\"img/dollar.png\" height=\"300\" width=\"300\">");

        let bar_id = "rect[id='" + d["BIKESHARE_ID"] + "']";
        d3.select(bar_id)
            .style("fill", "#ED2020");

        let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
        d3.select(map_id)
            .attr("xlink:href", "img/highlight.png");

        tooltipUp.style("visibility", "visible");
        tooltipDown.style("visibility", "visible");
        tooltipSymbol.style("visibility", "visible");
    }

    function mouse_move(event) {
        tooltipUp.style("top", (event.pageY-tooltipHeight-tooltip23Height-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
        tooltipDown.style("top", (event.pageY-tooltip23Height-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
        tooltipSymbol.style("top", (event.pageY-tooltip23Height-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
    }

    function mouse_out(d, y_value){
        d3.selectAll(".bar")
            .style("fill", function(d) { return pick_color(d[y_value], y_value) });

        let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
        d3.select(map_id)
            .attr("xlink:href", function () { return pick_img(d[y_value], y_value) });

        tooltipUp.style("visibility", "hidden");
        tooltipDown.style("visibility", "hidden");
        tooltipSymbol.style("visibility", "hidden");
    }

    function draw_bars(x_value, y_value) {
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data
            .sort(function(a, b) { return b[y_value] - a[y_value] })
            .map(function(d) { return d[x_value] }))
            .paddingInner(0.1)
            .paddingOuter(0.1)
        ;
        y.domain([0, d3.max(data, function(d) { return d[y_value] })]);

        // add x-axis
        let x_axis = g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height).toString() + ")")
            .call(d3.axisBottom(x));

        // add texts on x-axis
        x_axis.selectAll("text")
            .attr("y", 13)
            .attr("x", 0)
            .attr("dx", ".35em")
            .style("text-anchor", "end");

        let title_font_size = 16;

        // add x-axis title
        x_axis.append("text")
            .attr("x", width/2)  // center aligned title
            .attr("y", title_font_size*2)
            .attr("dy", "0.7em")
            .attr("text-anchor", "middle")
            .attr("font-size", title_font_size)
            .attr('fill', 'black')
            .text("Station ID");

        // y-axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(d3.format(".0s")))
            .append("text")  // add y-axis title
            .attr("x", 0)
            .attr("y", -title_font_size)
            .attr("dy", "0.7em")
            .attr("text-anchor", "start")
            .attr("font-size", title_font_size)
            .attr('fill', 'black')
            .text(y_value);

        // bars
        g.selectAll(".bar")
            .data(data.sort(function(a, b){ return b["INCOME"] - a["INCOME"]} ))
            .enter().append("rect")
            .attr("class", "bar")
            .attr("id", function(d) { return d["BIKESHARE_ID"] })
            .attr("x", function(d) { return x(d[x_value]) })
            .attr("y", function(d) { return y(d[y_value]) })
            .attr("width", function() { return x.bandwidth() })
            .attr("height", function(d) { return height - y(d[y_value]) })
            .attr("fill", function(d) { return pick_color(d[y_value], y_value) })
            .on("mouseover", function (d) { mouse_over(d, y_value) })
            .on("mousemove", function () { mouse_move(event) })
            .on("mouseout", function (d) { mouse_out(d, y_value) });
    }

    function new_draw_map(data) {
        let bound = new google.maps.LatLngBounds();

        data.forEach(function(d){
            let long = +d.X;
            let lat = +d.Y;
            bound.extend(new google.maps.LatLng(lat, long));
        });

        // Create the Google Map
        let styledMapType = new google.maps.StyledMapType([
                {
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#ebe3cd"
                        }
                    ]
                },
                {
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#523735"
                        }
                    ]
                },
                {
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "color": "#f5f1e6"
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "administrative",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#c9b2a6"
                        }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#dcd2be"
                        }
                    ]
                },
                {
                    "featureType": "administrative.land_parcel",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#ae9e90"
                        }
                    ]
                },
                {
                    "featureType": "landscape.natural",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#dfd2ae"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#dfd2ae"
                        }
                    ]
                },
                {
                    "featureType": "poi",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#93817c"
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#a5b076"
                        }
                    ]
                },
                {
                    "featureType": "poi.park",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#447530"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#f5f1e6"
                        }
                    ]
                },
                {
                    "featureType": "road",
                    "elementType": "labels.icon",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "road.arterial",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#fdfcf8"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#f8c967"
                        }
                    ]
                },
                {
                    "featureType": "road.highway",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#e9bc62"
                        }
                    ]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#e98d58"
                        }
                    ]
                },
                {
                    "featureType": "road.highway.controlled_access",
                    "elementType": "geometry.stroke",
                    "stylers": [
                        {
                            "color": "#db8555"
                        }
                    ]
                },
                {
                    "featureType": "road.local",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#806b63"
                        }
                    ]
                },
                {
                    "featureType": "transit",
                    "stylers": [
                        {
                            "visibility": "off"
                        }
                    ]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#dfd2ae"
                        }
                    ]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#8f7d77"
                        }
                    ]
                },
                {
                    "featureType": "transit.line",
                    "elementType": "labels.text.stroke",
                    "stylers": [
                        {
                            "color": "#ebe3cd"
                        }
                    ]
                },
                {
                    "featureType": "transit.station",
                    "elementType": "geometry",
                    "stylers": [
                        {
                            "color": "#dfd2ae"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "geometry.fill",
                    "stylers": [
                        {
                            "color": "#b9d3c2"
                        }
                    ]
                },
                {
                    "featureType": "water",
                    "elementType": "labels.text.fill",
                    "stylers": [
                        {
                            "color": "#92998d"
                        }
                    ]
                }
            ], {name: 'Styled Map'});

        let map = new google.maps.Map(d3.select("#map").node(), {
            zoom: 10,
            center: new google.maps.LatLng(39.97, -82.99),
            mapTypeControl: false
        });

        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('styled_map', styledMapType);
        map.setMapTypeId('styled_map');

        map.fitBounds(bound);

        let overlay = new google.maps.OverlayView();

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {
            let layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "effective");

            // Draw each marker as a separate SVG element.
            overlay.draw = function() {
                let projection = this.getProjection(),
                    padding = 10;

                let marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform) // update existing markers
                    .enter().append("svg")
                    .each(transform)
                    .attr("class", "marker");

                let y_value = options_selected();

                // Add an image to each location
                marker.append("image")
                    .attr("xlink:href", function (d) { return pick_img(d[y_value], y_value) })
                    .attr("class", "pin")
                    .attr("id", function(d) { return d["BIKESHARE_ID"] + "map" })
                    .attr("height", 30)
                    .attr("width", 30)
                    .attr("x", padding)
                    .attr("y", padding)
                    .on("mouseover", function (d) { mouse_over(d, y_value) })
                    .on("mousemove", function () { mouse_move(event) })
                    .on("mouseout", function (d) {mouse_out(d, y_value)});

                function transform(d) {
                    d = new google.maps.LatLng(+d.Y, +d.X);
                    d = projection.fromLatLngToDivPixel(d);

                    return d3.select(this)
                        .style("left", (d.x - padding) + "px")
                        .style("top", (d.y - padding) + "px");
                }
            };
        };

        overlay.setMap(map); // Bind our overlay to the map
    }

    function write_conclusion() {
        let y_value = options_selected();

        let conclusion = {"INCOME": "<div id='conclusion_content'> Conclusion: Income <br><br> " +
            "Based on neighborhood income data collected from www.city-data.com, it appears that " +
            "CoGo stations are primarily placed to serve community that has annual median household " +
            "income lower than $80,000. CoGo bikes in lower-income areas are less likely to be used " +
            "comparing to bikes in higher-income areas.</div>",
        "POPULATION": "<div  id='conclusion_content'> Conclusion: Population <br><br> Based on " +
        "neighborhood population data collected from www.city-data.com, it appears that CoGo stations " +
        "are primarily placed to serve community that has population lower than 2,000. </div>"};

        d3.select("#conclusion")
            .html(conclusion[y_value]);
    }


    let options_list = ['POPULATION', 'INCOME'];

    let svg_w = 800,
        svg_h = 260,
        margin = {top: 60, right: 30, bottom: 60, left: 30},
        width = svg_w - margin.left - margin.right,
        height = svg_h - margin.top - margin.bottom;

    let svg = d3.select("#bar_chart").append("svg").attr("width", svg_w).attr("height", svg_h);

    let x = d3.scaleBand().rangeRound([0, width]),
        y = d3.scaleLinear().rangeRound([height, 0]);

    let tooltipWidth = 280;
    let tooltipHeight = 50;
    let tooltip23Height = 50;

    let tooltipUp = d3.select("body")  // site name
        .append("div")
        .attr("class", "tooltipUp")
        .style("width", tooltipWidth + "px")
        .style("height", tooltipHeight + "px");

    let tooltipDown = d3.select("body")  // value
        .append("div")
        .attr("class", "tooltipDown")
        .style("width", tooltipWidth + "px")
        .style("height", tooltip23Height + "px");

    let tooltipSymbol = d3.select("body")  // symbol
        .append("div")
        .attr("class", "tooltipSymbol")
        .style("height", tooltip23Height + "px");

    draw_list(options_list);
    new_draw_map(data);
    draw_bars("BIKESHARE_ID", options_list[options_list.length-1]);
    write_conclusion();
});
