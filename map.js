d3.json("stations.json", function(error, data) {
    if (error) throw error;

    // draw the radio list
    function draw_list(options_list){
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
                draw_bars("BIKESHARE_ID", options_selected())
        })
    }

    // find the option selected in the radio list
    function options_selected(){
        // looks at dynamically drawn options and adds any 'checked' values to the list
        let checked = document.querySelectorAll('input[name="options"]:checked');
        checked = Array.prototype.slice.call(checked);

        return checked[0].id
    }

    // pick color for bar chart
    function pick_color(value) {
        if (value < 20000) {
            return "#AED6F1"
        } else if (value < 40000) {
            return "#5DADE2"
        } else if (value < 60000) {
            return "#2E86C1"
        } else if (value < 80000) {
            return "#21618C"
        } else return "#34495E"
    }

    // pick the markers on the map
    function pick_img(value) {
        if (value < 20000) {
            return "img/0_20.png"
        } else if (value < 40000) {
            return "img/20_40.png"
        } else if (value < 60000) {
            return "img/40_60.png"
        } else if (value < 80000) {
            return "img/60_80.png"
        } else return "img/80+.png"
    }

    function draw_bars(x_value, y_value) {
        let g = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(data
            .sort(function(a, b) { return b[y_value] - a[y_value] })
            .map(function(d) { return d[x_value] }));
        y.domain([0, d3.max(data, function(d) { return d[y_value] }) * 1.2]);

        // x-axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + (height).toString() + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", -10)
            .attr("dy", ".35em")
            .attr("transform", "rotate(-90)")
            .style("text-anchor", "end");

        // y-axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10)
                .tickFormat(d3.format(".0s")))
            .append("text")
            .attr("x", 6)
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "start")
            .attr("font-family", "sans-serif")
            .style('fill', 'black')
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
            .style("fill", function(d) { return pick_color(d["INCOME"]) })
            .on("mouseover", function (d) {
                let t_text = d["SITE_NAME"] +
                    "<br>----------------------" +
                    "<br>"+ y_value + ":" + d[y_value];
                tooltipBar.html(t_text);

                let bar_id = "rect[id='" + d["BIKESHARE_ID"] + "']";
                d3.select(bar_id)
                    .style("fill", "brown");

                let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
                d3.select(map_id)
                    .attr("xlink:href", "img/highlight.png");

                return tooltipBar.style("visibility", "visible");
            })
            .on("mousemove", function(){
                return tooltipBar.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
            })
            .on("mouseout", function(d){
                d3.selectAll(".bar")
                    .style("fill", function(d) { return pick_color(d["INCOME"]) });

                let map_id = "image[id='" + d["BIKESHARE_ID"] + "map']";
                d3.select(map_id)
                    .attr("xlink:href", pick_img(d["INCOME"]));

                return tooltipBar.style("visibility", "hidden");
            });
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
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                let projection = this.getProjection(),
                    padding = 10,
                    marker = layer.selectAll("svg")
                    .data(data)
                    .each(transform) // update existing markers
                    .enter().append("svg")
                    .each(transform)
                    .attr("class", "marker");

                // Add an image to each location
                console.log(data);
                marker.append("image")
                    .attr("xlink:href", function (d) { return pick_img(d["INCOME"]) })
                    .attr("id", function(d) { return d["BIKESHARE_ID"] + "map" })
                    .attr("height", 30)
                    .attr("width", 30)
                    .attr("x", padding)
                    .attr("y", padding)
                    .on("mouseover", function(d) {
                        let t_text = d["SITE_NAME"] +
                            "<br>----------------------" +
                            "<br>" + "Income" + ":" + d["INCOME"];
                        tooltipMap.html(t_text);

                        let bar_id = "rect[id='" + d["BIKESHARE_ID"] + "']";
                        d3.select(bar_id)
                            .style("fill", "brown");

                        return tooltipMap.style("visibility", "visible");
                    })
                    .on("mousemove", function() {
                        return tooltipMap.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                    })
                    .on("mouseout", function() {
                        d3.selectAll(".bar")
                            .style("fill", function(d) { return pick_color(d["INCOME"]) });
                        return tooltipMap.style("visibility", "hidden");
                    });

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


    let options_list = ['POPULATION', 'INCOME'];

    let svg_w = 800,
        svg_h = 300,
        margin = {top: 20, right: 40, bottom: 30, left: 60},
        width = svg_w - margin.left - margin.right,
        height = svg_h - margin.top - margin.bottom;

    let svg = d3.select("#bar_chart").append("svg").attr("width", svg_w).attr("height", svg_h);

    let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

    let tooltipMap = d3.select("body")
        .append("div")
        .attr("class", "tooltip_map")
        .html("");

    let tooltipBar = d3.select("body")
        .append("div")
        .attr("class", "tooltip_bar")
        .html("");

    draw_list(options_list);
    new_draw_map(data, options_list);
    draw_bars("BIKESHARE_ID", options_list[options_list.length-1]);
});
