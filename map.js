var margin = {top: 20, right: 40, bottom: 30, left: 60},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#barChart").append("svg").attr("width", 700).attr("height", 450);

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("stations.json", function(error, data) {
    if (error) throw error;

    function draw_list(search_opt, options_list, all_options){
        //dynamically draws the list_radio checkboxes

        //1. Set the list title and sort the options_list
        document.getElementById('list_title').innerHTML = search_opt.toUpperCase() + " <i>(click to filter)</i>";

        options_list.sort();

        //2. get distinct values of search_opt from data
        //dynamically create radio button with none selected
        radio_string = "";
        for (i = 0; i < options_list.length; i++) {
            radio_string += "<input type='radio' id='" + options_list[i] ;
            radio_string += "' name='options' value='" + options_list[i] + "checked='checked'";
            radio_string += "'><label for='" + options_list[i] + "'>" + options_list[i];
            radio_string += "</label>&nbsp;&nbsp;";
        }

        document.getElementById('list_radio').innerHTML = radio_string;

        //set the on_change event to redraw charts whenever a checkbox option is selected
        d3.selectAll('input[name="options"]')
            .on('change', function() {
                //return a list of 'selected' radios or none if there are none
                all_options = options_selected();

                //redraw charts according to selections
                new_draw_map(data, options_list, search_opt, all_options)
        })
    }

    function reset_data() {
        //creates a set of distinct 'option' values dependent on search_opt
        options_list = ['INCOME', 'POPULATION'];
    }

    function options_selected(){
        //looks at dynamically drawn options and adds any 'checked' values to the list
        var checked = document.querySelectorAll('input[name="options"]:checked');
        checked = Array.prototype.slice.call(checked);
        my_list = [];

        if (checked.length === 0) { }  // there are no checked checkboxes
        else { checked.forEach(function(d) { my_list.push(d.id) }) }  // there are some checked checkboxes

        // return my_list;
        return [];
    }

    function draw_charts() {
        draw_list(search_opt, options_list);
        new_draw_map(data, options_list, search_opt);
        draw_bars();
    }
    
    function draw_bars() {
        x.domain(data.map(function(d) { return d.SITE_NAME; }));
        y.domain([0, d3.max(data, function(d) { return d.INCOME; })]);

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

        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(10)
                .tickFormat(d3.format(".0s")))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .style('fill', 'black')
            .text("Frequency");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.SITE_NAME); })
            .attr("y", function(d) { return y(d.INCOME); })
            .attr("width", function() {
                console.log(x.bandwidth());
                return x.bandwidth()
            })
            .attr("height", function(d) { return height - y(d.INCOME); });
    }

    function apply_filters(data, search_opt, filter_by){
        //used by both bars, line and donut
        //filters the data by values in filter_by if a filtering list exists

        if (filter_by === undefined){ filter_by = [] }

        if (filter_by.length > 0) {
            my_data = data.filter(function(d){
                return filter_by.indexOf(d[search_opt]) > -1;
            });
        }
        else{ my_data = data; }

        return my_data;
    }

    function new_draw_map(data, options_list, search_opt, filter_by) {
        // Apply filters
        my_data = apply_filters(data, search_opt, filter_by);

        var bound = new google.maps.LatLngBounds();

        my_data.forEach(function(d){
            long = +d.X;
            lat = +d.Y;
            bound.extend(new google.maps.LatLng(lat, long));
        });

        // Create the Google Map
        var styledMapType = new google.maps.StyledMapType([
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

        var map = new google.maps.Map(d3.select("#map").node(), {
            zoom: 8,
            center: new google.maps.LatLng(39.97, -82.99),
            mapTypeControl: false
        });

        //Associate the styled map with the MapTypeId and set it to display.
        map.mapTypes.set('styled_map', styledMapType);
        map.setMapTypeId('styled_map');

        map.fitBounds(bound);

        var overlay = new google.maps.OverlayView();

        // Add the container when the overlay is added to the map.
        overlay.onAdd = function() {
            var layer = d3.select(this.getPanes().overlayMouseTarget).append("div").attr("class", "effective");

            // Draw each marker as a separate SVG element.
            // We could use a single SVG, but what size would it have?
            overlay.draw = function() {
                var projection = this.getProjection(),
                    padding = 10;

                var tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip_map")
                    .html("");

                var marker = layer.selectAll("svg")
                    .data(my_data)
                    .each(transform) // update existing markers
                    .enter().append("svg")
                    .each(transform)
                    .attr("class", "marker");

                // Add an image to each location.
                marker.append("image")
                    .attr("xlink:href", "80+.png")
                    .attr("height", 30)
                    .attr("width", 30)
                    .attr("x", padding)
                    .attr("y", padding)
                    .on("mouseover", mouseOver)
                    .on("mousemove", function(){
                        return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
                    })
                    .on("mouseout", function(){
                        return tooltip.style("visibility", "hidden");
                    });

                function mouseOver(d){
                    t_text = "Site Name: " + d.SITE_NAME + "<br>Income: " + d.INCOME;
                    tooltip.html(t_text);
                    return tooltip.style("visibility", "visible");
                }

                function transform(d) {
                    d = new google.maps.LatLng(+d.Y, +d.X);
                    d = projection.fromLatLngToDivPixel(d);

                    return d3.select(this)
                        .style("left", (d.x - padding) + "px")
                        .style("top", (d.y - padding) + "px");
                }
            };
        };

        // Bind our overlay to the map
        overlay.setMap(map);
    };

    var search_opt = 'SITE_NAME';
    var all_options = true;

    reset_data();
    draw_charts();
});
