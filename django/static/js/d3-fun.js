const COLOR_PREV = '#4CEAFF';
const COLOR_CURR = '#FFE74C';
const COLOR_NEXT = '#6BF178';
const COLOR_PRIMARY = "#1A537F";
const CIRCLE_STROKE = 2;

var data = {
   prev: [{
    name: "Implementation of the data-flow synchronous language SIGNAL", 
    author: "Pascalin Amagbégnon , Loïc Besnard , Paul Le Guernic",
    year: "1995",
    keywords: "", 
    affiliation: "IRSA-INRIA",
    location: [48.116282, -1.639774]
   }, {
    name: "The synchronous languages 12 years later",
    author: "A., Caspi, P., Edwards, S. A., Halbwachs, N., Guernic, P. L., Robert, and Simone, D",
    year: "2003",
    keywords: "Embedded systems, Esterel, formal methods, Lustre, real-time systems, Signal, synchronous languages", 
    affiliation: "IRSA-INRIA",
    location: [48.116282, -1.639774]
   }],
   curr: [{
     name: "A Survey on Reactive Programming",
     author: "Engineer Bainomugisha , Andoni Lombide Carreton,Tom van Cutsem, Stijn Mostinckx, Wolfgang de Meuter", 
     year: "2013",
     keywords: "Design, Languages, Reactive programming, interactive applications, event-driven applications, dataflow programming, functional reactive programming, reactive systems", 
     affiliation: " Vrije Universiteit Brussel", 
     location: [50.823165, 4.392326]
    }],
   next: [{
    name: "Alma-O: an imperative language that supports declarative programming", 
    author: "Krzysztof R. Apt , Jacob Brunekreef , Vincent Partington , Andrea Schaerf", 
    year: "1998",
    keywords: "Laguages, declarative programming, imperative programming, search", 
    affiliation: "University of Amsterdam", 
    location: [52.355818, 4.955726]
   }, {
     name: "Multi-Tier Functional Reactive Programming for the Web", 
     author: "Bob Reynders , Dominique Devriese , Frank Piessens",
     year: "2014",
     keywords: "Functional Reactive Programming, FRP, Multitier Web Framework", 
     affiliation: "University of Singapore", 
     location: [1.296643, 103.776394]
   }, {
    name:"Reactive programming with reactive variables",
    author: "Christopher Schuster , Cormac Flanagan", 
    year: "2016", 
    keywords: "Reactive Programming, Syntax Extension, JavaScript", 
    affiliation: "University of California", 
    location: [32.880060, -117.234014]
   
   }]
 };

 // function computeDivSize(div) {
 //    var size = window.getComputedStyle(div, null);

 // }
var c10 = d3.scale.category10();
var svg = d3.select("#graph-container svg");

// svg.append('svg:defs').append('svg:marker')
// .attr('id', 'mid-arrow')
// .attr('viewBox', '0 -5 10 10')
// .attr('refX', 6)
// .attr('markerWidth', 10)
// .attr('markerHeight', 10)
// .attr('orient', 'auto')
// .append('svg:path')
// .attr('d', 'M0,-5L10,0L0,5L6,0')
// .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
.attr('id', 'mid-arrow')
.attr('viewBox', '0 -5 10 10')
.attr('refX', 4)
.attr('markerWidth', 10)
.attr('markerHeight', 10)
.attr('orient', 'auto')
.append('svg:path')
.attr('d', 'M10,-5L0,0L10,5L6,0')
.attr('fill', '#000');

var container_width = parseInt(window.getComputedStyle(svg[0][0], null).getPropertyValue("width"));
var container_height = parseInt(window.getComputedStyle(svg[0][0], null).getPropertyValue("height"));
var mid_width = container_width/2;
var mid_height = container_height/2;

var dot_radius = 40;
var dot_space = 100;
var col_offset = 400;

var left_column_offset = ((container_height-((data.prev.length-1)*dot_space)-dot_radius*2)/2)-(dot_radius*1.5);
var right_column_offset = ((container_height-((data.next.length-1)*dot_space)-dot_radius*2)/2)-(dot_radius*1.5);

var tooltip = d3.select("body").append("div")   
.attr("class", "tooltip")               
.style("opacity", 0);

var y = left_column_offset;
var links = svg.selectAll("link")
.data(data.prev)
.enter()
.append("line")
.attr("class", "link")
.attr("x1", function(l) {
    y = y+dot_space;
    d3.select(this).attr("y1", y);
    return mid_width-col_offset;
})
.attr("x2", function(l) {
    const x1 = parseInt(d3.select(this).attr("x1"));
    const y1 = parseInt(d3.select(this).attr("y1"));
    d3.select(this).attr("y2", y1+(mid_height-y1)/2);
    return x1+(col_offset/2);
})
.attr("fill", "none")
.attr("stroke", "black")
.attr("marker-end", 'url(#mid-arrow)');

var y = left_column_offset;
var links = svg.selectAll("link")
.data(data.prev)
.enter()
.append("line")
.attr("class", "link")
.attr("x1", function(l) {
    y = y+dot_space;
    d3.select(this).attr("y1", y+(mid_height-y)/2);
    return mid_width-(col_offset/2);
})
.attr("x2", function(l) {
    d3.select(this).attr("y2", mid_height);
    return mid_width;
})
.attr("fill", "none")
.attr("stroke", "black")

var y = right_column_offset;
var links = svg.selectAll("link")
.data(data.next)
.enter()
.append("line")
.attr("class", "link")
.attr("x1", function(l) {
    d3.select(this).attr("y1", mid_height);
    return mid_width;
})
.attr("x2", function(l) {
    y = y + dot_space;
    d3.select(this).attr("y2", mid_height+(mid_height-y)/2);
    return mid_width+(col_offset/2);
})
.attr("fill", "none")
.attr("stroke", "black")
.attr("marker-end", 'url(#mid-arrow)');

var y = right_column_offset;
var links = svg.selectAll("link")
.data(data.next)
.enter()
.append("line")
.attr("class", "link")
.attr("x2", function(l) {
    y = y+dot_space;
    d3.select(this).attr("y2", y);
    return mid_width+col_offset;
})
.attr("x1", function(l) {
    const y2 = parseInt(d3.select(this).attr("y2"));
    d3.select(this).attr("y1", mid_height-(mid_height-y2)/2);
    return mid_width+(col_offset/2);
})
.attr("fill", "none")
.attr("stroke", "black")

// NODES

var y = left_column_offset;
svg.selectAll("node")
.data(data.prev)
.enter()
.append("circle")
.attr("class", "prev-node node")
.attr("cx", mid_width-col_offset)
.attr("cy", function(d) {
    y = y+dot_space;
    return y
}.bind(y))
.attr("r", dot_radius)
.attr("fill", COLOR_PREV)
.attr("stroke", "black")
.attr("stroke-width", CIRCLE_STROKE)
.on({
    "mouseover": function(d) {  
        d3.select(this).style("cursor", "pointer");    
        tooltip.transition()        
            .duration(200)      
            .style("opacity", .95);      
        tooltip .html("<b>"+d.name+"</b><hr>"+d.author + "<br>"+d.year +'<hr><span class="tag prev-tag">'+ d.keywords.split(", ").join('</span><span class="tag prev-tag">')+"</span>")  
            .style("left", (d3.select(this).attr("cx") - $(tooltip[0][0]).width()/2) + "px")     
            .style("top", (d3.select(this).attr("cy") - $(tooltip[0][0]).height()) + "px");    
    },
    "mouseout": function(d) {    
        d3.select(this).style("cursor", "default"); 
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    }
}); 

svg.selectAll("node")
.data(data.curr)
.enter()
.append("circle")
.attr("class", "curr-node node")
.attr("cx", mid_width)
.attr("cy", mid_height)
.attr("r", dot_radius)
.attr("fill", COLOR_CURR)
.attr("stroke", "black")
.attr("stroke-width", CIRCLE_STROKE)
.on({
    "click": function(d) {
        var speed = 750;
        $('html, body').animate( { scrollTop: $("#map-container").offset().top }, speed ); 
    },
    "mouseover": function(d) {
        d3.select(this).style("cursor", "pointer");
        tooltip.transition()        
            .duration(200)      
            .style("opacity", .95);      
        tooltip .html("<b>"+d.name+"</b><hr>"+d.author + "<br>"+d.year +'<hr><span class="tag curr-tag">'+ d.keywords.split(", ").join('</span><span class="tag curr-tag">')+"</span>")  
            .style("left", (d3.select(this).attr("cx") - $(tooltip[0][0]).width()/2) + "px")     
            .style("top", (d3.select(this).attr("cy") - $(tooltip[0][0]).height()) + "px");    
    },
    "mouseout": function(d) {
        d3.select(this).style("cursor", "default");
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);
    }
});

var y = right_column_offset;
svg.selectAll("node")
.data(data.next)
.enter()
.append("circle")
.attr("class", "next-node node")
.attr("cx", mid_width+col_offset)
.attr("cy", function(d) {
    y = y+dot_space;
    return y
})
.attr("r", dot_radius)
.attr("fill", COLOR_NEXT)
.attr("stroke", "black")
.attr("stroke-width", CIRCLE_STROKE)
.on({
    "mouseover": function(d) {  
        d3.select(this).style("cursor", "pointer");    
        tooltip.transition()        
            .duration(200)      
            .style("opacity", .95);      
        tooltip .html("<b>"+d.name+"</b><hr>"+d.author + "<br>"+d.year +'<hr><span class="tag next-tag">'+ d.keywords.split(", ").join('</span><span class="tag next-tag">')+"</span>")
            .style("left", (d3.select(this).attr("cx") - $(tooltip[0][0]).width()/2) + "px")     
            .style("top", (d3.select(this).attr("cy") - $(tooltip[0][0]).height()) + "px");    
    },
    "mouseout": function(d) {    
        d3.select(this).style("cursor", "default"); 
        tooltip.transition()        
            .duration(500)      
            .style("opacity", 0);   
    }
});

//#### NAV ####

const NAV_LENGTH = 200;
const NAV_EXTREMITY = 50;
const NAV_OFFSET = 50;
const NAV_STROKE_WIDTH = 3;
const NAV_DOT_RADIUS = 8;
const NAV_DOT_STROKE_WIDTH = 2;
const NAV_DOT_SPACE = 25;
const NAV_HISTORY_SIZE = 3;

var nav_text = d3.select("body").append("div")   
.attr("class", "nav_text")
.style("opacity", 0);

svg
.append("line")
.style("stroke", "black")
.style("stroke-width", NAV_STROKE_WIDTH)
.attr("x1", mid_width-(NAV_LENGTH/2))
.attr("y1", container_height-NAV_OFFSET)
.attr("x2", mid_width+(NAV_LENGTH/2))
.attr("y2", container_height-NAV_OFFSET);

svg
.append("line")
.style("stroke", "black")
.style("stroke-width", NAV_STROKE_WIDTH)
.style("stroke-dasharray", ("3, 3"))
.attr("x1", mid_width-(NAV_LENGTH/2)-NAV_EXTREMITY)
.attr("y1", container_height-NAV_OFFSET)
.attr("x2", mid_width-(NAV_LENGTH/2))
.attr("y2", container_height-NAV_OFFSET);

svg
.append("line")
.style("stroke", "black")
.style("stroke-dasharray", ("3, 3"))
.style("stroke-width", NAV_STROKE_WIDTH)
.attr("x1", mid_width+(NAV_LENGTH/2))
.attr("y1", container_height-NAV_OFFSET)
.attr("x2", mid_width+(NAV_LENGTH/2)+NAV_EXTREMITY)
.attr("y2", container_height-NAV_OFFSET);

svg.append("circle")
.attr("cx", mid_width)
.attr("cy", container_height-NAV_OFFSET)
.attr("r", NAV_DOT_RADIUS)
.attr("fill", COLOR_CURR)
.attr("stroke", "black")
.attr("stroke-width", NAV_DOT_STROKE_WIDTH)
.on({
    "mouseover": function(d) {
        nav_text.transition()        
            .duration(200)      
            .style("opacity", .95);  
        d3.select(this).style("cursor", "pointer");   
        nav_text.html("Currently displayed article.")
        .style("left", (d3.select(this).attr("cx") - $(nav_text[0][0]).width()/2) + "px")     
        .style("top", (container_height-15) + "px"); 
    },
    "mouseout": function(d) {
        d3.select(this).style("cursor", "default"); 
        nav_text.transition()        
        .duration(500)      
        .style("opacity", 0);  
    }
});

for (var i=1; i<NAV_HISTORY_SIZE+1; ++i) {
    svg.append("circle")
    .attr("cx", mid_width-(i*NAV_DOT_SPACE))
    .attr("cy", container_height-NAV_OFFSET)
    .attr("r", NAV_DOT_RADIUS)
    .attr("fill", (i==1 ? COLOR_PREV : COLOR_PRIMARY))
    .attr("stroke", "black")
    .attr("stroke-width", NAV_DOT_STROKE_WIDTH)
    .on({
        "mouseover": function(d) {
            nav_text.transition()        
            .duration(200)      
            .style("opacity", .95);   
            d3.select(this).style("cursor", "pointer");
            nav_text.html("Navigate to the th node on the path to a founding article.")
            .style("left", (d3.select(this).attr("cx") - $(nav_text[0][0]).width()/2) + "px")  
            .style("top", (container_height-15) + "px");
        },
        "mouseout": function(d) {
            d3.select(this).style("cursor", "default");
            nav_text.transition()        
            .duration(500)      
            .style("opacity", 0);
        }
    });
}

svg.append("circle")
.attr("cx", mid_width+NAV_DOT_SPACE)
.attr("cy", container_height-NAV_OFFSET)
.attr("r", NAV_DOT_RADIUS)
.attr("fill", COLOR_NEXT)
.attr("stroke", "black")
.attr("stroke-width", NAV_DOT_STROKE_WIDTH)
.on({
    "mouseover": function(d) {
        nav_text.transition()        
        .duration(200)      
        .style("opacity", .95);
        d3.select(this).style("cursor", "pointer");
        nav_text.html("Navigate randomly to an article that reference the selected article.")
        .style("left", (d3.select(this).attr("cx") - $(nav_text[0][0]).width()/2) + "px")  
        .style("top", (container_height-15) + "px");
    },
    "mouseout": function(d) {
        d3.select(this).style("cursor", "default");
        nav_text.transition()        
        .duration(500)      
        .style("opacity", 0); 
    }
});

svg.append("circle")
.attr("cx", mid_width-(NAV_LENGTH/2)-NAV_EXTREMITY+5)
.attr("cy", container_height-NAV_OFFSET)
.attr("r", NAV_DOT_RADIUS)
.attr("fill", COLOR_PRIMARY)
.attr("stroke", "black")
.attr("stroke-width", NAV_DOT_STROKE_WIDTH)
.on({
    "mouseover": function(d) {
        nav_text.transition()        
        .duration(200)      
        .style("opacity", .95);
        d3.select(this).style("cursor", "pointer");
        nav_text.html("Navigate to a founding article.")
        .style("left", (d3.select(this).attr("cx") - $(nav_text[0][0]).width()/2) + "px")  
        .style("top", (container_height-15) + "px");
    },
    "mouseout": function(d) {
        nav_text.transition()        
        .duration(500)      
        .style("opacity", 0); 
        d3.select(this).style("cursor", "default");
    }
});

//#### LEGEND ####

const LEGEND_LENGTH = 66
const LEGEND_H_OFFSET = 30
const LEGEND_V_OFFSET = 50
const LEGEND_TEXT_OFFSET = 10

svg
.append("line")
.attr("class", "legend-line")
.attr("x1", container_width-LEGEND_LENGTH-LEGEND_H_OFFSET)
.attr("y1", container_height-LEGEND_V_OFFSET)
.attr("x2", container_width-(LEGEND_LENGTH/2)-LEGEND_H_OFFSET)
.attr("y2", container_height-LEGEND_V_OFFSET)
.attr("fill", "none")
.attr("stroke", "black")
.attr("marker-end", 'url(#mid-arrow)');

svg
.append("line")
.attr("class", "legend-line")
.attr("x1", container_width-(LEGEND_LENGTH/2)-LEGEND_H_OFFSET)
.attr("y1", container_height-LEGEND_V_OFFSET)
.attr("x2", container_width-LEGEND_H_OFFSET)
.attr("y2", container_height-LEGEND_V_OFFSET)
.attr("fill", "none")
.attr("stroke", "black")

svg.append("text")
.attr("x", container_width-LEGEND_LENGTH-LEGEND_H_OFFSET)
.attr("y", container_height-LEGEND_V_OFFSET-LEGEND_TEXT_OFFSET)
.text("references")

//#### MAP ####

var map = L.map('map-container').setView([51.505, -0.09], 2);
var displayed_markers = { prev: true, curr: true, next: true };
var clust_markers_icon = {
    "001" : function(p,c,n) { return { html: "<div class='marker next-tag'><span>"+n+"</span></div>", iconSize:L.point(30,30) } },
    "010" : function(p,c,n) { return { html: "<div class='marker curr-tag'><span>"+c+"</span></div>", iconSize:L.point(30,30) } },
    "011" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker curr-tag'><span>"+c+"</span></div><div class='marker next-tag'><span>"+n+"</span></div></div>", iconSize:L.point(60,30) } },
    "100" : function(p,c,n) { return { html: "<div class='marker prev-tag'><span>"+p+"</span></div>", iconSize:L.point(30,30) } },
    "101" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker prev-tag'><span>"+p+"</span></div><div class='marker next-tag'><span>"+n+"</span></div></div>", iconSize:L.point(60,30) } },
    "110" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker prev-tag'><span>"+p+"</span></div><div class='marker curr-tag'><span>"+c+"</span></div></div>", iconSize:L.point(60,30) } },
    "111" : function(p,c,n) { return { html: "<div class='cluster-container top-clust'><div class='marker prev-tag'><span>"+p+"</span></div></div><div class='cluster-container'><div class='marker curr-tag'><span>"+c+"</span></div><div class='marker next-tag'><span>"+n+"</span></div></div>", iconSize:L.point(60,60) } },
};

var markers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
        var mkers = cluster.getAllChildMarkers();
        var cnt = {prev:0, curr:0, next:0};
        for (var i=0; i<mkers.length; ++i) {
            cnt[mkers[i].cls] += 1;
        }
        var clust_key = '' + (+(cnt.prev>0)) + (+(cnt.curr>0)) + (+(cnt.next>0));
        var iconOptions = clust_markers_icon[clust_key](cnt.prev, cnt.curr, cnt.next);
        iconOptions.className = "cluster";
        return L.divIcon(iconOptions);
    }
});

const bounds = new L.LatLngBounds(new L.LatLng(85, -180), new L.LatLng(-85, 180));
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    minZoom: 2,
    maxBoundsViscosity: 1.0,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(map);

map.on('drag', function() {
    map.panInsideBounds(bounds, { animate: false });
});

function populates_markers(mkers, cls) {
    for (var i=0; i<mkers.length; ++i) {
        var marker = L.marker(mkers[i].location);
        marker.cls = cls;
        markers.addLayer(marker);
    }
}

function draw_markers() {
    markers.clearLayers();
    for (var key in displayed_markers) {
        if (displayed_markers[key]) {
            populates_markers(data[key], key);
        }
    }
    map.addLayer(markers);
};

function toggle_filter(self, marker_grp) {
    displayed_markers[marker_grp] = !displayed_markers[marker_grp];
    if (displayed_markers[marker_grp])
        $(self).children().first().show();
    else
        $(self).children().first().hide();
    draw_markers();
}

draw_markers();