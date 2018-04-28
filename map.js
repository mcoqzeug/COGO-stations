d3.json("stations.json", function(error, data) {
    if (error) throw error;

    // draw the radio list
    function draw_list(options_list) {
        // get distinct values of search_opt from data
        // dynamically create radio button with none selected
        let radio_string = "";

        for (let i = 0; i < options_list.length; i++) {
            let op = attributeCovert[options_list[i]];
            radio_string += "<input type='radio' id='" + options_list[i] +
                "' name='options' value='" + options_list[i] + "' checked='checked'" +
                "><label class=\"tooltipO\" for='" + options_list[i] + "'>" + op +
                "<span class=\"tooltipOText\">Tooltip text</span></label>&nbsp;&nbsp;";
        }

        document.getElementById('list_radio').innerHTML = radio_string;

        // set the on_change event to redraw charts whenever a checkbox option is selected
        d3.selectAll('input[name="options"]')
            .on('change', function() {
                draw_chart();

                d3.selectAll(".pin").remove();// remove old pins
                new_draw_map(data);  // TODO draw new map or only draw the pins

                d3.select("#conclusion").selectAll("div").remove();  // remove old conclusion
                write_conclusion();  // add new conclusion
        });

        // set the on_change event to redraw charts whenever a checkbox option is selected
        d3.selectAll('input[name="options2"]')
            .on('change', function() {
                draw_chart();
            });
    }

    // find the option selected in the radio list
    function select_option() {
        // looks at dynamically drawn options and adds any 'checked' values to the list
        let checked = document.querySelectorAll('input[name="options"]:checked');
        checked = Array.prototype.slice.call(checked);

        return checked[0].id
    }

    function pick_color(value, y_value) {
        if (y_value === "INCOME") {
            if (value < 20000) {
                return colors[y_value][0][1]
            } else if (value < 40000) {
                return colors[y_value][1][1]
            } else if (value < 60000) {
                return colors[y_value][2][1]
            } else if (value < 80000) {
                return colors[y_value][3][1]
            } else return colors[y_value][4][1]
        } else if (y_value === "POPULATION") {
            if (value < 1000) {
                return colors[y_value][0][1]
            } else if (value < 2000) {
                return colors[y_value][1][1]
            } else if (value < 3000) {
                return colors[y_value][2][1]
            } else if (value < 4000) {
                return colors[y_value][3][1]
            } else return colors[y_value][4][1]
        } else if (y_value === "N_HOUSEHOLD") {
            if (value < 300) {
                return colors[y_value][0][1]
            } else if (value < 600) {
                return colors[y_value][1][1]
            } else if (value < 900) {
                return colors[y_value][2][1]
            } else if (value < 1200) {
                return colors[y_value][3][1]
            } else return colors[y_value][4][1]
        } else if (y_value === "AGE") {
            if (value < 20) {
                return colors[y_value][0][1]
            } else if (value < 25) {
                return colors[y_value][1][1]
            } else if (value < 30) {
                return colors[y_value][2][1]
            } else if (value < 35) {
                return colors[y_value][3][1]
            } else return colors[y_value][4][1]
        }
    }

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
        } else if (y_value === "N_HOUSEHOLD") {  // TODO change pins
            if (value < 1000) {
                return "img/0_1.png"
            } else if (value < 2000) {
                return "img/1_2.png"
            } else if (value < 3000) {
                return "img/2_3.png"
            } else if (value < 4000) {
                return "img/3_4.png"
            } else return "img/4+.png"
        } else if (y_value === "AGE") {  // TODO change pins
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
        let t_value = attributeCovert[y_value] + ": " + "<br>" + d[y_value];

        tooltipUp.html(t_text);
        tooltipDown.html(t_value);
        if (y_value === "INCOME") {
            tooltipSymbol.html("<img class=\"symbolImg\" src=\"img/dollar.png\">");
        } else if (y_value === "POPULATION") {
            tooltipSymbol.html("<img class=\"symbolImg\" src=\"img/population.png\">");
        }

        let bar_id = "rect[id='" + d["BIKESHARE_ID"] + "']";
        d3.select(bar_id)
            .style("fill", "#ED2020");

        let dot_id = "circle[id='" + d["BIKESHARE_ID"] + "']";
        d3.select(dot_id)
            .style("fill", "#ED2020");

        let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
        d3.select(map_id)
            .attr("xlink:href", "img/highlight.png");

        tooltipUp.style("visibility", "visible");
        tooltipDown.style("visibility", "visible");
        tooltipSymbol.style("visibility", "visible");
    }

    function mouse_move(event) {
        tooltipUp.style("top", (event.pageY-tooltipHeight-tooltipHeight-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
        tooltipDown.style("top", (event.pageY-tooltipHeight-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
        tooltipSymbol.style("top", (event.pageY-tooltipHeight-20)+"px").style("left",(event.pageX-tooltipWidth-20)+"px");
    }

    function mouse_out(d, y_value){
        d3.selectAll(".bar")
            .style("fill", function(d) { return pick_color(d[y_value], y_value) });

        d3.selectAll(".dot")
            .style("fill", function(d) { return pick_color(d[y_value], y_value) });

        let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
        d3.select(map_id)
            .attr("xlink:href", function () { return pick_img(d[y_value], y_value) });

        tooltipUp.style("visibility", "hidden");
        tooltipDown.style("visibility", "hidden");
        tooltipSymbol.style("visibility", "hidden");
    }

    function draw_chart () {
        let checked = document.querySelectorAll('input[name="options2"]:checked');
        let option_selected = Array.prototype.slice.call(checked)[0].id;

        svg.selectAll("*").remove();  // remove old bars
        if (option_selected === "bar") {
            draw_bars("BIKESHARE_ID", select_option());  // draw new bars
        } else if (option_selected === "scatter_plot") {
            draw_scatter("COUNT", select_option());  // draw new bars
        }
    }

    function add_legends(g, y_value) {
        let legend = g.append('g')
            .attr("transform", "translate("+ (width+20).toString() + ", 0)")
            .selectAll(".legend")
            .data(colors[y_value])
            .enter();

        legend.append("rect")
            .attr("class","legend")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function (d) { return d[1] })
            .attr("transform", function (d, i) { return "translate(0, " + (i*25).toString() + ")" });

        legend.append("text")
            .attr('fill', 'black')
            .attr("text-anchor", "start")
            .attr("transform", function (d, i) { return "translate(24, " + (15 + i*25).toString() + ")" })
            .text(function (d) { return d[0] });
    }

    function draw_bars(x_value, y_value) {
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleBand().rangeRound([0, width]),
            y = d3.scaleLinear().rangeRound([height, 0]);

        let y_offset = 0;

        if (y_value === "INCOME") {
            y_offset = 0;
        } else if (y_value === "POPULATION") {
            y_offset = 0;
        } else if (y_value === "N_HOUSEHOLD") {
            y_offset = 0;
        } else if (y_value === "AGE") {
            y_offset = 17;
        }

        x.domain(data
            .sort(function(a, b) { return a[y_value] - b[y_value] })
            .map(function(d) { return d[x_value] }))
            .paddingInner(0.1)
            .paddingOuter(0.1);
        y.domain([y_offset, d3.max(data, function(d) { return d[y_value] })]);

        // add x-axis
        // let x_axis = g.append("g")
        //     .attr("class", "axis--x")
        //     .attr("transform", "translate(0," + (height).toString() + ")")
        //     // .call(d3.axisBottom(x))
        // ;

        let title_font_size = 16;

        // // add x-axis title
        // x_axis.append("text")
        //     .attr("x", width/2)  // center aligned title
        //     .attr("y", title_font_size*2)
        //     .attr("dy", "0.7em")
        //     .attr("text-anchor", "middle")
        //     .attr("font-size", title_font_size)
        //     .attr('fill', 'black')
        //     .text("Stations");
        g.append("text")
            .attr("transform", "translate(" + width/2 + "," + (height+title_font_size).toString() + ")")
            .attr("text-anchor", "middle")
            .attr("font-size", title_font_size)
            .attr('fill', 'black')
            .text("Stations")
        ;

        let yTickFormat = d3.format(".0s");

        if (y_value === "N_HOUSEHOLD") {
            yTickFormat = null;
        }


        // y-axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y)
                .ticks(5)
                .tickFormat(yTickFormat)
            )
            .append("text")  // add y-axis title
            .attr("x", 0)
            .attr("y", -title_font_size)
            .attr("dy", "0.7em")
            .attr("text-anchor", "start")
            .attr("font-size", title_font_size)
            .attr('fill', 'black')
            .text(attributeCovert[y_value]);

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


        add_legends(g, y_value);

    }

    function draw_scatter(x_value, y_value) {
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // set the ranges
        let x = d3.scaleLinear().range([0, width]),
            y = d3.scaleLinear().range([height, 0]);

        let y_offset = 0;

        if (y_value === "INCOME") {
            y_offset = 5000;
        } else if (y_value === "POPULATION") {
            y_offset = 500;
        } else if (y_value === "N_HOUSEHOLD") {
            y_offset = 100;
        } else if (y_value === "AGE") {
            y_offset = 2;
        }

        let title_font_size = 16;  // font size of labels

        // Scale the range of the data
        x.domain([d3.min(data, function(d) { return d[x_value]; }) - 500,
                  d3.max(data, function(d) { return d[x_value]; }) + 500
        ]);
        y.domain([d3.min(data, function(d) { return d[y_value]; }) - y_offset,
                  d3.max(data, function(d) { return d[y_value]; }) + y_offset
        ]);

        // Add the scatter plot
        g.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("id", function(d) { return d["BIKESHARE_ID"] })
            .attr("r", 5)
            .attr("cx", function(d) { return x(d[x_value]); })
            .attr("cy", function(d) { return y(d[y_value]); })
            .attr("fill", function(d) { return pick_color(d[y_value], y_value) })
            .on("mouseover", function (d) { mouse_over(d, y_value) })
            .on("mousemove", function () { mouse_move(event) })
            .on("mouseout", function (d) { mouse_out(d, y_value) });

        // Add the X Axis
        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            // .attr("class", "axis--x2")
            .call(d3.axisBottom(x)
                .ticks(5)
                .tickFormat(d3.format(".0s")))
            .append("text")
            .attr("x", width/2)  // center aligned title
            .attr("y", title_font_size*2)
            .attr("dy", "0.7em")
            .attr("text-anchor", "middle")
            .attr("font-size", title_font_size)
            .attr('fill', 'black')
            .text("Count");

        // Add the Y Axis
        g.append("g")
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
            .text(attributeCovert[y_value]);

        add_legends(g, y_value)
    }

    function new_draw_map(data) {
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
            zoom: 12,
            center: new google.maps.LatLng(39.97, -82.99),
            mapTypeControl: false
        });

        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('styled_map', styledMapType);
        map.setMapTypeId('styled_map');

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

                let y_value = select_option();

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
        let y_value = select_option();

        let conclusion = {"INCOME": "Conclusion: Income <br><br>" +
            "Based on neighborhood income data collected from www.city-data.com, it appears that " +
            "CoGo stations are primarily placed to serve community that has annual median household " +
            "income lower than $80,000. CoGo bikes in lower-income areas are less likely to be used " +
            "comparing to bikes in higher-income areas.",
            "POPULATION": "Conclusion: Population  <br><br>Based on " +
            "neighborhood population data collected from www.city-data.com, it appears that CoGo stations " +
            "are primarily placed to serve community that has population lower than 2,000."};

        d3.select("#conclusion")
            .html(conclusion[y_value]);
    }


    let options_list = ['POPULATION', 'N_HOUSEHOLD', 'AGE','INCOME'];

    let attributeCovert = {
        "INCOME": "Income",
        "POPULATION": "Population",
        "N_HOUSEHOLD": "Households",
        "AGE": "Age"
    };

    // legends colors
    let colors = {
        "INCOME": [["0-20k", "#99CCFF"],["20k-40k", "#649EE2"], ["40k-60k", "#3674CE"], ["60k-80k", "#2E619E"], [">80k", "#193556"]],
        "POPULATION": [["0-1k", "#E3C7F2"], ["1-2k", "#D786EA"], ["2-3k", "#B237CC"], ["3-4k", "#75198C"], [">5k", "#491E54"]],
        "N_HOUSEHOLD": [["0-300", "#D1F2EB"],["300-600", "#76D7C4"], ["600-900", "#16A085"], ["900-1200", "#0E6251"], [">1200", "#145A32"]],
        "AGE": [["0-20", "#D1F2EB"],["20-25", "#76D7C4"], ["25-30", "#16A085"], ["30-35", "#0E6251"], [">35", "#145A32"]]
    };

    let svg_w = 800,
        svg_h = 300,
        margin = {top: 50, right: 100, bottom: 50, left: 40},
        width = svg_w - margin.left - margin.right,
        height = svg_h - margin.top - margin.bottom;

    let svg = d3.select("#chart").append("svg").attr("width", svg_w).attr("height", svg_h);

    let tooltipWidth = 280;
    let tooltipHeight = 60;

    let tooltipUp = d3.select("body")  // site name
        .append("div")
        .attr("class", "tooltipUp")
        .style("width", tooltipWidth + "px")
        .style("height", tooltipHeight + "px");

    let tooltipDown = d3.select("body")  // value
        .append("div")
        .attr("class", "tooltipDown")
        .style("width", tooltipWidth + "px")
        .style("height", tooltipHeight + "px");

    let tooltipSymbol = d3.select("body")  // symbol
        .append("div")
        .attr("class", "tooltipSymbol")
        .style("height", tooltipHeight + "px");

    draw_list(options_list);
    new_draw_map(data);
    draw_chart();
    write_conclusion();
});
