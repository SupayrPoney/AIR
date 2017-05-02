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

var svg = d3.select("#graph-container svg");

svg.append('svg:defs').append('svg:marker')
.attr('id', 'mid-arrow-left')
.attr('viewBox', '0 -5 10 10')
.attr('refX', 4)
.attr('markerWidth', 10)
.attr('markerHeight', 10)
.attr('orient', 'auto')
.append('svg:path')
.attr('d', 'M10,-5L0,0L10,5L6,0')
.attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
.attr('id', 'mid-arrow-right')
.attr('viewBox', '0 -5 10 10')
.attr('refX', 4)
.attr('markerWidth', 10)
.attr('markerHeight', 10)
.attr('orient', 'auto')
.append('svg:path')
.attr('d', 'M0,-5L10,0L0,5L5,0')
.attr('fill', '#000');

var tooltip = d3.select("body").append("div")   
.attr("class", "tooltip")               
.style("opacity", 0);

function getComputedProperty(obj, property) {
    return parseInt(window.getComputedStyle(obj, null).getPropertyValue(property));
}

function scroll_to(id) {
    $('html, body').animate( { scrollTop: $(id).offset().top }, 750); 
}

const DOT_RADIUS = 40;
const DOT_SPACE = 100;
const COL_OFFSET = 400;

var container_width = getComputedProperty($("svg")[0], "width");
var container_height = getComputedProperty($("svg")[0], "height");
var sidebar_offset = getComputedProperty($("search")[0], "width");
var mid_width = container_width/2;
var mid_height = container_height/2;
var mid = {x: mid_width, y: mid_height};

var left_column_offset = ((container_height-((data.prev.length-1)*DOT_SPACE)-DOT_RADIUS*2)/2)-(DOT_RADIUS*1.5);
var right_column_offset = ((container_height-((data.next.length-1)*DOT_SPACE)-DOT_RADIUS*2)/2)-(DOT_RADIUS*1.5);


function draw_link(frm, to, arrow) {
    const mid_x = frm.x + (to.x-frm.x)/2;
    const mid_y = frm.y + (to.y-frm.y)/2;
    svg.append("line")
    .attr("class", "link")
    .attr("x1", frm.x)
    .attr("y1", frm.y)
    .attr("x2", mid_x)
    .attr("y2", mid_y)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("marker-end", arrow);
    svg.append("line")
    .attr("class", "link")
    .attr("x1", mid_x)
    .attr("y1", mid_y)
    .attr("x2", to.x)
    .attr("y2", to.y)
    .attr("fill", "none")
    .attr("stroke", "black");
}

function draw_links(nb_links, x, y, arrow) {
    for (var i=0; i<nb_links; ++i) {
        y += DOT_SPACE;
        draw_link({x:x,y:y}, mid, arrow)
    }
}

// NODES

function draw_nodes(datas, x, y, color, type, onclick) {
    var circle = svg.selectAll(type)
    .data(datas)
    .enter()
    .append("circle")
    .attr("class", "node "+type)
    .attr("cx", x)
    .attr("cy", function(d) {
        y += DOT_SPACE;
        return y;
    })
    .attr("r", DOT_RADIUS)
    .attr("fill", color)
    .attr("stroke", "black")
    .attr("stroke-width", CIRCLE_STROKE)
    .on({
        mouseover: function(d) {  
            d3.select(this).style("cursor", "pointer");    
            tooltip.transition()        
                .duration(200)      
                .style("opacity", .95);      
            tooltip.html("<b>"+d.name+"</b><hr>"+d.author + "<br>"+d.year +'<hr><span class="tag '+type+'">'+ d.keywords.split(", ").join('</span><span class="tag '+type+'">')+"</span>")  
                .style("left", (d3.select(this).attr("cx") - $(tooltip[0][0]).width()/2 + sidebar_offset) + "px")     
                .style("top", (d3.select(this).attr("cy") -1.5*DOT_RADIUS - $(tooltip[0][0]).height()) + "px");    
        },
        mouseout: function() {    
            d3.select(this).style("cursor", "default"); 
            tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
        },
        click: onclick
    });
}

function draw_scene() {
    draw_links(data.prev.length, mid_width-COL_OFFSET, left_column_offset, "url(#mid-arrow-left)");
    draw_links(data.next.length, mid_width+COL_OFFSET, right_column_offset, "url(#mid-arrow-right)")
    draw_nodes(data.prev, mid_width-COL_OFFSET, left_column_offset, COLOR_PREV, "prev");
    draw_nodes(data.curr, mid_width, mid_height-DOT_SPACE, COLOR_CURR, "curr", function(){scroll_to("#map-container")});
    draw_nodes(data.next, mid_width+COL_OFFSET, right_column_offset, COLOR_NEXT, "next");
}

draw_scene();

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

function draw_line(x1, y1, x2, y2, type) {
    var line = svg.append("line")
    .style("stroke", "black")
    .style("stroke-width", NAV_STROKE_WIDTH)
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x2)
    .attr("y2", y2);
    if (type=="dotted") {
        line.style("stroke-dasharray", ("3, 3"));
    }
};

function draw_nav_nodes(datas) {
    svg.selectAll("nav-node")
    .data(datas)
    .enter()
    .append("circle")
    .attr("class", "nav-node")
    .attr("cx", function(d) { return d.x })
    .attr("cy", function(d) { return d.y })
    .attr("r", NAV_DOT_RADIUS)
    .attr("fill", function(d) { return d.color })
    .attr("stroke", "black")
    .attr("stroke-width", NAV_DOT_STROKE_WIDTH)
    .on({
        "mouseover": function(d) {
            nav_text.transition()        
                .duration(200)      
                .style("opacity", .95);  
            d3.select(this).style("cursor", "pointer");   
            nav_text.html(d.text)
            .style("left", (d3.select(this).attr("cx") - $(nav_text[0][0]).width()/2) + sidebar_offset + "px")     
            .style("top", (container_height-NAV_OFFSET-30) + "px"); 
        },
        "mouseout": function(d) {
            d3.select(this).style("cursor", "default"); 
            nav_text.transition()        
            .duration(500)      
            .style("opacity", 0);  
        }
    })
}

function draw_nav() {
    const mid1_x = mid_width-(NAV_LENGTH/2);
    const mid2_x = mid_width+(NAV_LENGTH/2);
    const y = container_height-NAV_OFFSET;
    draw_line(mid1_x-NAV_EXTREMITY, y, mid1_x, y, "dotted");
    draw_line(mid1_x, y, mid2_x, y);
    draw_line(mid2_x, y, mid2_x+NAV_EXTREMITY, y, "dotted");
    const nav_datas = [
        { 
            text: "Currently displayed article.",
            x: mid_width,
            y: y,
            color: COLOR_CURR
        }, {
            text: "Navigate randomly to an article that reference the selected article.",
            x: mid_width+NAV_DOT_SPACE,
            y: y,
            color: COLOR_NEXT
        }, {
            text: "Navigate to a founding article.",
            x: mid1_x-NAV_EXTREMITY+5,
            y: y,
            color: COLOR_PRIMARY,
        }
    ];
    for (var i=1; i<NAV_HISTORY_SIZE+1; ++i) {
        nav_datas.push({
            text: "Navigate to the "+i+"th node on the path to a founding article.",
            x: mid_width-(i*NAV_DOT_SPACE),
            y: y,
            color: (i==1 ? COLOR_PREV : COLOR_PRIMARY)
        });
    }
    draw_nav_nodes(nav_datas);
}
draw_nav();

//#### LEGEND ####

const LEGEND_LENGTH = 66
const LEGEND_H_OFFSET = 30
const LEGEND_V_OFFSET = 50
const LEGEND_TEXT_OFFSET = 10

const legend_x = container_width-LEGEND_H_OFFSET;
const legend_y = container_height-LEGEND_V_OFFSET;
draw_link(
    { x: legend_x-LEGEND_LENGTH, y: legend_y }, 
    { x: legend_x, y: legend_y }, 
    'url(#mid-arrow-left)'
)

svg.append("text")
.attr("x", container_width-LEGEND_LENGTH-LEGEND_H_OFFSET)
.attr("y", container_height-LEGEND_V_OFFSET-LEGEND_TEXT_OFFSET)
.text("references")

//#### MAP ####

var map = L.map('map-container',{
                                    minZoom: 3
                                })
           .setView([51.505, -0.09], 2);
var displayed_markers = { prev: true, curr: true, next: true };
var clust_markers_icon = {
    "001" : function(p,c,n) { return { html: "<div class='marker next'><span>"+n+"</span></div>", iconSize:L.point(30,30) } },
    "010" : function(p,c,n) { return { html: "<div class='marker curr'><span>"+c+"</span></div>", iconSize:L.point(30,30) } },
    "011" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker curr'><span>"+c+"</span></div><div class='marker next'><span>"+n+"</span></div></div>", iconSize:L.point(60,30) } },
    "100" : function(p,c,n) { return { html: "<div class='marker prev'><span>"+p+"</span></div>", iconSize:L.point(30,30) } },
    "101" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker prev'><span>"+p+"</span></div><div class='marker next'><span>"+n+"</span></div></div>", iconSize:L.point(60,30) } },
    "110" : function(p,c,n) { return { html: "<div class='cluster-container'><div class='marker prev'><span>"+p+"</span></div><div class='marker curr'><span>"+c+"</span></div></div>", iconSize:L.point(60,30) } },
    "111" : function(p,c,n) { return { html: "<div class='cluster-container top-clust'><div class='marker prev'><span>"+p+"</span></div></div><div class='cluster-container'><div class='marker curr'><span>"+c+"</span></div><div class='marker next'><span>"+n+"</span></div></div>", iconSize:L.point(60,60) } },
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
L.DomEvent.disableClickPropagation(L.DomUtil.get('filter-box')); 
L.DomEvent.disableClickPropagation(L.DomUtil.get('back')); 