const COLORS = {
    prev: '#4CEAFF',
    curr: '#FFE74C',
    next: '#6BF178',
    primary: "#1A537F"
}

const ICONS = {
    prev: "static/images/docPrev.png",
    curr: "static/images/docCurr.png",
    next: "static/images/docNext.png",
}

const COLOR_PREV = '#4CEAFF';
const COLOR_CURR = '#FFE74C';
const COLOR_NEXT = '#6BF178';
const COLOR_PRIMARY = "#1A537F";
const CIRCLE_STROKE = 2;

L.MakiMarkers.accessToken = 'pk.eyJ1Ijoic3VwYXlycG9uZXkiLCJhIjoiY2oyZGRvYXdjMDAxYTJ4bXV5YXUzMzRocCJ9.v50KWa63j5PHSN7_HACjyg'

var data = {
     prev: [{
        title: "Paper your paper references",
        authors:["Author1"],
        keywords: ["keyword1", "keyword2"],
        publication: {cover_date : "2006-12-08"},
        affiliation: [{
            name: "IRSA-INRIA",
            geo: {  lat: 48.116282,
                    lon: -1.639774
            }
        }]
    }],
    curr: [{
       title: "Start by looking up a title<br><small style='color: white;'>(e.g.: 'A survey on reactive programming')</small>",
       authors: ["Author"],
       publication: {cover_date : "2015-12-08"},
       keywords: ["Keyword1", "Keyword2", "keyword3"],
       affiliation: [{
            name: "Vrije Universiteit Brussel",
            geo: {  lat: 50.823165,
                    lon: 4.392326
            }
       }]
    }],
    next: [{
        title: "A paper that references your paper",
        authors: ["Author2"],
        publication: {cover_date : "2016-12-08"},
        keywords: ["keyword1", "keyword2", "keyword3"],
        affiliation: [{
            name: "University of Amsterdam",
            geo: {  lat: 52.355818,
                    lon: 4.955726
            }
        }]
    }]
};

let history = []

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
});
};

function draw_arrow_heads() {
    svg.append('svg:defs').append('svg:marker')
    .attr('class', 'arrow')
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
    .attr('class', 'arrow')
    .attr('id', 'mid-arrow-right')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 10)
    .attr('markerHeight', 10)
    .attr('orient', 'auto')
    .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5L5,0')
    .attr('fill', '#000');
}

var svg = d3.select("#graph-container svg");

var tooltip = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

function getComputedProperty(obj, property) {
    return parseInt(window.getComputedStyle(obj, null).getPropertyValue(property));
}

function scroll_to(id) {
    $('html, body').animate( { scrollTop: $(id).offset().top }, 750);
}

const PAPER_HEIGHT = 70;
const PAPER_WIDTH = PAPER_HEIGHT/1.25;
const ICON_SPACE = 100;
const TRANSITION_UNIT = 750;
const PAGINATOR_H_OFFSET = 30;
const PAGINATOR_V_OFFSET = 10;

var container_width;
var container_height;
var sidebar_offset;
var mid_width;
var mid_height;
var mid;
var papers_per_page;
var col_offset;
var pages;
var paper_counter;

function init() {
    d3.selectAll('svg > *').remove()
    container_width = getComputedProperty($("svg")[0], "width");
    container_height = getComputedProperty($("svg")[0], "height");
    sidebar_offset = getComputedProperty($("search")[0], "width");
    mid_width = container_width/2;
    mid_height = container_height/2;
    mid = {x: mid_width, y: mid_height};
    papers_per_page = Math.max(Math.min(~~((container_height-250)/ICON_SPACE), 7), 3);
    col_offset = 2.5*container_width/8;
    pages = {next:0, prev:0};
    paper_counter = {next:1, prev:1}
    draw_arrow_heads();
}

init()

window.onresize = () => {
    init()
    draw_scene()
}

var left_column_offset;
var right_column_offset;


function draw_link(frm, to, arrow, cls, fade_in) {
    const mid_x = frm.x + (to.x-frm.x)/2;
    const mid_y = frm.y + (to.y-frm.y)/2;
    var l1 = svg.append("line")
    .attr("class", "link "+cls)
    .attr("x1", frm.x)
    .attr("y1", frm.y)
    .attr("x2", mid_x)
    .attr("y2", mid_y)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("marker-end", arrow);
    var l2 = svg.append("line")
    .attr("class", "link "+cls)
    .attr("x1", mid_x)
    .attr("y1", mid_y)
    .attr("x2", to.x)
    .attr("y2", to.y)
    .attr("fill", "none")
    .attr("stroke", "black");
    if (fade_in) {
        l1.style("opacity", 0.0)
        .transition()
        .delay(TRANSITION_UNIT)
        .duration(TRANSITION_UNIT)
        .style("opacity", 1.0);
        l2.style("opacity", 0.0)
        .transition()
        .delay(TRANSITION_UNIT)
        .duration(TRANSITION_UNIT)
        .style("opacity", 1.0);
    }
}

function draw_links(nb_links, x, y, arrow, cls, fade_in) {
    for (var i=0; i<nb_links; ++i) {
        y += ICON_SPACE;
        draw_link({x:x,y:y}, mid, arrow, cls, fade_in)
    }
}

function select_paper() {
    d3.selectAll(".paper-link")
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity", 0.0)
    .remove();
    d3.selectAll(".paper-info")
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity", 0.0)
    .remove();
    d3.selectAll(".info-bg")
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity", 0.0)
    .remove();
    d3.select(this).transition()
    .duration(TRANSITION_UNIT)
    .delay(2*TRANSITION_UNIT)
    .attr("x", mid_width-PAPER_WIDTH/2)
    .attr("y", mid_height-PAPER_HEIGHT/2);
    const isPrev = (d3.select(this).attr("class")=="paper paper-prev");
    d3.selectAll(isPrev ? ".paper-next" : ".paper-prev")
    .transition()
    .duration(TRANSITION_UNIT)
    .delay(2*TRANSITION_UNIT)
    .attr("x", isPrev ? container_width+PAPER_WIDTH : -PAPER_WIDTH);
    var self = this;
    d3.selectAll(!isPrev ? ".paper-next" : ".paper-prev")
    .filter(function(n,i){return (this!==self)})
    .transition()
    .duration(TRANSITION_UNIT)
    .delay(TRANSITION_UNIT)
    .style("opacity", 0.0)
    d3.select(".tooltip")
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity",0.0);
    d3.selectAll(".paper-curr")
    .call(setupCallback)
    .transition()
    .duration(TRANSITION_UNIT)
    .delay(2*TRANSITION_UNIT)
    .attr("x", (isPrev ? mid_width+col_offset : mid_width-col_offset)-PAPER_WIDTH/2)
    .each("end", onMove);
    d3.selectAll(".paper")
    .transition()
    .duration(TRANSITION_UNIT)
    .delay(3*TRANSITION_UNIT)
    .style("opacity", 0.0)
    .remove();
    d3.selectAll(".paginator")
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity", 0.0)
    .remove();
    pages = {next:0, prev:0};
}

function setupCallback(sel) {
    counter = sel.size();
}

function onMove() {
    --counter;
    if (counter==0) {
        draw_scene();
    }
}

// NODES
function present_authors(data) {
    var authors = data.authors;
    var text = "";
    if ((typeof authors === "undefined") || (authors.length == 0)) { text = "-"; }
    else if (authors.length == 1) { text = authors[0]; }
    else if(authors.length ==2){ text = authors[0].concat(" & ").concat(authors[1]); }
    else {
        text = authors[0].concat(" et al.");
    }
    return text
}


function present_authors_date(data){
    let text = present_authors(data)
    if (data.publication) {
        if (data.publication.cover_date) {
            text += ` , ${data.publication.cover_date.split(/-/)[0]}`;
        }
    }
    return text;
};


function draw_papers(datas, x, y, image_url, type, onclick, pagin) {
    $("#forward").show();
    const l = PAPER_WIDTH/2;
    var papers = svg.selectAll("paper")
    .data(datas)
    .enter()
    .append("svg:image")
    .attr("class", "paper paper-"+type)
    .attr("x", function(d) {
        if ((type=="curr") || pagin) {
            return x-l;
        } else {
            if (type=="prev") {
                return -PAPER_WIDTH;
            } else {
                return container_width+PAPER_WIDTH;
            }
        }
    })
    .attr("y", function(d) {
        y += ICON_SPACE;
        var h = PAPER_HEIGHT/2;
        if (type=="curr") {
            return y-h;
        } else {
            d.finalPos = y-h;
            if (pagin) return pagin>1 ? container_height+PAPER_HEIGHT : -PAPER_HEIGHT;
            var proj = (h*(PAPER_WIDTH+mid_width)/(col_offset))-h;
            return y<mid_height ? y-h-proj : y-h+proj;
        }
    })
    .attr("width", PAPER_WIDTH)
    .attr("height", PAPER_HEIGHT)
    .attr("xlink:href", image_url)
    .on({
        mouseover: function(d) {
            d3.select(this).style("cursor", "pointer");
            tooltip.transition()
            .duration(200)
            .style("opacity", .95);
            let authors = present_authors(d)
            tooltip.html(typeof d.publication !== "undefined" ?
                "<b>"+d.title+"</b><hr>"+authors + "<br>"+d.publication.cover_date +'<hr><span class="tag '+type+'">'+ d.keywords.join('</span><span class="tag '+type+'">')+"</span>"
            :
                "<b>"+d.title+'</b><hr>n/a<br>n/a<hr><span class="tag '+type+'"></span>'
            ).style("left", (d3.select(this).attr("x") - $(tooltip[0][0]).width()/2 + PAPER_WIDTH/2 + sidebar_offset) + "px")
            .style("top", (d3.select(this).attr("y") -PAPER_HEIGHT/3 - $(tooltip[0][0]).height()) + "px");
        },
        mouseout: function() {
            d3.select(this).style("cursor", "default");
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        },
        click: onclick
    })


    if ((type=="curr") && (!pagin)) {
        papers.style("opacity", 0.0)
        .transition()
        .duration(TRANSITION_UNIT)
        .style("opacity", 1.0);
    } else {
        papers.transition()
        .duration(TRANSITION_UNIT)
        .attr("x", x-l)
        .attr("y", function(d) {
            return d.finalPos;
        });
    }
}

function display_authors(datas, x, y, type, pagin){
    const l = PAPER_WIDTH/2;
    var texts = svg.selectAll("paper-info")
    .data(datas)
    .enter()
    .append("text")
    .text( (d) => {return present_authors_date(d);})
    .style("text-anchor", "middle")
    .attr("class", "paper-info paper-info-"+type)
    .attr("x", x)
    .attr("y", function(d) {
        y += ICON_SPACE;
        return y+PAPER_HEIGHT/2+17;
    }).style("opacity", 0.0)
    .transition()
    .duration(TRANSITION_UNIT)
    .delay(TRANSITION_UNIT)
    .style("opacity", 1.0)
    .each(function(d) {
        svg.append("rect")
        .attr("class", "info-bg info-bg-"+type)
        .attr("x", d3.select(this).attr("x")-this.getComputedTextLength()/2-2)
        .attr("y", d3.select(this).attr("y")-13)
        .attr("width", this.getComputedTextLength()+4)
        .attr("height", 16)
        .attr("fill", "white")
        .style("opacity",0.0)
        .transition()
        .duration(TRANSITION_UNIT)
        .delay(TRANSITION_UNIT)
        .style("opacity", 1.0);
    })
    d3.selectAll(".paper-info").moveToFront();

}

function paginator_transition(type, isUp) {
    function onEnd() {
        --counter;
        if (counter==0) {
            type=="prev" ? draw_prev(+isUp+1) : draw_next(+isUp+1);
            d3.selectAll(".paper-curr").moveToFront();
            d3.selectAll(".info-bg-curr").moveToFront();
            d3.selectAll(".paper-info-curr").moveToFront();
        }
    }
    d3.selectAll(".paper-info-"+type)
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity",0.0)
    .remove()
    d3.selectAll(".info-bg-"+type)
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity",0.0)
    .remove()
    d3.selectAll(".link-"+type)
    .call(setupCallback)
    .transition()
    .duration(TRANSITION_UNIT)
    .style("opacity", 0.0)
    .each("end", onEnd)
    .remove();
    d3.selectAll(".paper-"+type)
    .transition()
    .delay(TRANSITION_UNIT)
    .duration(TRANSITION_UNIT)
    .attr("y", isUp ? -PAPER_HEIGHT : container_height+PAPER_HEIGHT)
    .remove();
}

function page_down(type) {
    if ((typeof data[type] === "undefined") || (paper_counter[type]<pages[type]*papers_per_page+papers_per_page)) {
        return false
    }
    const isNotMax = (pages[type]<(~~(data[type].length/papers_per_page)));
    if (isNotMax) {
        ++pages[type];
        paginator_transition(type, true);
    }
    return isNotMax;
}

function page_up(type) {
    const isNotMin = (pages[type]>0);
    if (isNotMin) {
        --pages[type];
        paginator_transition(type, false);
    }
    return isNotMin;
}

function draw_paginator(x, y, type) {
    var up = svg.append("rect")
    .attr("class", "paginator interactive")
    .attr("x", x+5)
    .attr("y", 20+y)
    .attr("width", PAPER_WIDTH-10)
    .attr("height", 20)
    .attr("fill", "lightgrey");

    var text = svg.append("text")
    .text(Math.max(pages[type]*papers_per_page, 1)+" - "+((pages[type]+1)*papers_per_page)+" of "+data[type].length)
    .attr("class", "paginator")
    .attr("x", x+PAPER_WIDTH/2)
    .attr("y", y+55)
    .style("text-anchor", "middle");

    var up_text = svg.append("svg:foreignObject")
    .attr("class", "paginator interactive")
    .attr("width", 20)
    .attr("height", 20)
    .attr("y", y+22)
    .attr("x", x+PAPER_WIDTH/2-7)
    .append("xhtml:span")
    .attr("class", "control glyphicon glyphicon-menu-up");

    var down = svg.append("rect")
    .attr("class", "paginator interactive")
    .attr("x", x+5)
    .attr("y", 60+y)
    .attr("width", PAPER_WIDTH-10)
    .attr("height", 20)
    .attr("fill", "lightgrey");

    var down_text = svg.append("svg:foreignObject")
    .attr("class", "paginator interactive")
    .attr("width", 20)
    .attr("height", 20)
    .attr("y", y+62)
    .attr("x", x+PAPER_WIDTH/2-7)
    .on({click: page_down})
    .append("xhtml:span")
    .attr("class", "control glyphicon glyphicon-menu-down");

    function reload() {
        text.text(Math.max(pages[type]*papers_per_page, 1)+" - "+Math.min((pages[type]+1)*papers_per_page, data[type].length)+" of "+data[type].length)
    }
    function up_click() { if (page_up(type)) reload() }
    function down_click() { if (page_down(type)) reload() }
    up.on({click:up_click});
    down.on({click:down_click});
    down_text.on({click:down_click});
    up_text.on({click:up_click});
}

function click_prev_next(d) {
    retrieve_data_by_title(d.title, select_paper.bind(this))
}

function draw_next(pagin) {
    var next_slice = data.next.slice(pages.next*papers_per_page, Math.min((pages.next+1)*papers_per_page, data.next.length));
    right_column_offset = ((container_height-((next_slice.length-1)*ICON_SPACE)-PAPER_HEIGHT)/2)-(PAPER_HEIGHT*0.95);
    draw_links(next_slice.length, mid_width+col_offset, right_column_offset, "url(#mid-arrow-right)", "paper-link link-next", true)
    draw_papers(next_slice, mid_width+col_offset, right_column_offset, NEXT_DOC_IMG_URL, "next", click_prev_next, pagin);
    display_authors(next_slice, mid_width+col_offset, right_column_offset,"next", pagin)
}

function draw_prev(pagin) {
    var prev_slice = data.prev.slice(pages.prev*papers_per_page, Math.min((pages.prev+1)*papers_per_page, data.prev.length));
    left_column_offset = ((container_height-((prev_slice.length-1)*ICON_SPACE)-PAPER_HEIGHT)/2)-(PAPER_HEIGHT*0.95);
    draw_links(prev_slice.length, mid_width-col_offset, left_column_offset, "url(#mid-arrow-left)", "paper-link link-prev", true);
    draw_papers(prev_slice, mid_width-col_offset, left_column_offset, PREV_DOC_IMG_URL, "prev", click_prev_next, pagin);
    display_authors(prev_slice, mid_width-col_offset, left_column_offset, "prev", pagin)
}

function draw_scene() {
    draw_legend();
    draw_prev(0);
    draw_next(0);
    draw_papers(data.curr, mid_width, mid_height-ICON_SPACE, CURR_DOC_IMG_URL, "curr", function(){scroll_to("#map-container")}, 0);
    display_authors(data.curr, mid_width, mid_height-ICON_SPACE, "curr", 0)
    if (data.prev.length>papers_per_page) draw_paginator(PAGINATOR_H_OFFSET, container_height-PAGINATOR_V_OFFSET-80, "prev");
    if (data.next.length>papers_per_page) draw_paginator(container_width-PAGINATOR_H_OFFSET-60, container_height-PAGINATOR_V_OFFSET-80, "next");
    refresh_article_name();
    refresh_keywords();
    draw_map();
}

//####### KEYWORDS-PART #########
function refresh_keywords(){
    var keywordsPaper =data.curr[0].keywords
    var div = document.getElementById("keywords-container");
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }

    keywordsPaper.forEach(function(keyword){
        var tag_div = document.createElement("div");
        tag_div.innerHTML= keyword;
        tag_div.className = "tag curr pointer";
        tag_div.onclick= function(){
            if (this.className.includes("curr")) {
                this.className = this.className.replace("curr", "unselected");
            }else{
                this.className = this.className.replace("unselected","curr");
            };

        }
        document.getElementById("keywords-container").appendChild(tag_div);
    });
};

var state = {can:false, run:{prev:false, next:false}}
//######## SEARCH-PART ########
function retrieve_data_by_title(title, callback) {
    display_loading()
    if (state.run.prev||state.run.next) {
        state.can = true;
        state.continue = function(){retrieve_data_by_title(title, callback)}
    } else {
        state.run = {prev:true, next:true};
        paper_counter = {prev:0, next:0}
        let drawn = false

        function batman() {
            if (paper_counter.prev >= Math.min(papers_per_page, data.prev.length) &&
                paper_counter.next >= Math.min(papers_per_page, data.next.length) &&
                !drawn) {
                drawn = true
                hide_loading()
                callback()
            }
            if (paper_counter.prev==data.prev.length)
                state.run.prev = false;
            if (paper_counter.next==data.next.length)
                state.run.next = false;
        }
        function draw_marker(node, cls) {
            if (node.affiliation) {
                add_one_marker(node, cls)
            }
        }
        markers.clearLayers();

        search_by_title(title, (new_data) => {
            if (new_data.title !== history[history.length - 1]) {
                history.push(new_data.title)
            }
            data.curr = [new_data]
            data.prev = new_data.prev
            data.next = new_data.next
            draw_marker(new_data, 'curr')
            batman()
            get_prev_one_by_one(new_data, state, (prev) => {
                data.prev[paper_counter.prev] = prev
                draw_marker(prev, 'prev')
                paper_counter.prev++
                batman()
            }, (error) => {
                console.error(error)
                paper_counter.prev++
                batman()
            })
            get_next_one_by_one(new_data, state, (next) => {
                data.next[paper_counter.next] = next
                draw_marker(next, 'next')
                paper_counter.next++
                batman()
            }, (error) => {
                console.error(error)
                paper_counter.next++
                batman()
            })
        }, (error) => display_error_message(error))
    }
}

function display_loading() {
    var loading_width = 210;
    var loading_height = 210
    svg.append("svg:image")
    .attr("xlink:href","/static/images/magnify.svg")
    .attr("width", loading_width)
    .attr("height", loading_height)
    .attr("class", "loading")
    .attr("x",mid_width - loading_width/2)
    .attr("y",mid_height-loading_width/2)
}

function hide_loading() {
    $(".loading").remove();
}

function display_error_message(error) {
    d3.selectAll("svg > *").remove();
    var error_message = "We could not find the searched article in the Scopus database.";
    state.run.next = false;
    state.run.prev = false;
    svg.append("text")
    .text(error_message)
    .attr("x",mid_width-error_message.length*6)
    .attr("y",mid_height)
    .attr("class", "error_message")
    .style("fill", "grey")
}
$('#searchButton').click((event) => {
    let value = $('#searchInput').val()
    retrieve_data_by_title(value, draw_scene);
    d3.selectAll("svg > *").remove();
    display_loading()
    $("#forward").hide();

    draw_arrow_heads();
    pages = {next:0, prev:0};
})


//######## GRAPH-PART #########
function refresh_article_name(){
    var titleDiv = document.querySelector("#article-name");
    titleDiv.innerHTML= data.curr[0].title
    //[0].name;
};

//######## HISTORY ########
$('#history-back').click((event) => {
    let title = history[history.length - 2]
    if (title) {
        history.pop()
        init()
        retrieve_data_by_title(title, draw_scene)
    }
})

//#### LEGEND ####

const LEGEND_LENGTH = 66
const LEGEND_H_OFFSET = 30
const LEGEND_V_OFFSET = 50
const LEGEND_TEXT_OFFSET = 10


function draw_legend(){
    const legend_x = container_width-LEGEND_H_OFFSET;
    const legend_y = LEGEND_V_OFFSET;
    draw_link(
        { x: legend_x-LEGEND_LENGTH, y: legend_y },
        { x: legend_x, y: legend_y },
        'url(#mid-arrow-left)',
        "legend-link"
        )


    svg.append("text")
    .attr("x", container_width-LEGEND_LENGTH-LEGEND_H_OFFSET)
    .attr("y", LEGEND_V_OFFSET-LEGEND_TEXT_OFFSET)
    .text("references")
}

function draw_hover_line(){
    svg.append("text")
    .attr("x", container_width/2- 240)
    .attr("y", 200)
    .text("Hover over the papers for more information")
    .style("font-size",25)
}
//#### MAP ####

var map = L.map('map-container',{minZoom: 3})
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
L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
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

function add_one_marker(node, cls) {
    var icon = L.icon({
        iconUrl: ICONS[cls],

        iconSize:     [52*0.7, 68*0.7], // size of the icon
        iconAnchor:   [26*0.7, 34*0.7], // point of the icon which will correspond to marker's location
        // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    if(node.affiliation) {
        node.affiliation.forEach((aff) => {
            if (aff.geo) {
                let location = [aff.geo.lat, aff.geo.lon]
                var marker = L.marker(location, {icon: icon});
                let authors = present_authors(node)
                marker.bindPopup(`<b>${node.title}</b><br>${authors} - <b>${node.publication.cover_date.split(/-/)[0]}</b>`);
                marker.cls = cls;
                markers.addLayer(marker);
            }
        })
    }

}

function populates_markers(mkers, cls) {
    for (var i=0; i<mkers.length; ++i) {
        add_one_marker(mkers[i], cls)
    }
}

function show_all_markers() {
    map.fitBounds(markers.getBounds());
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

function draw_map() {
    draw_markers();
    show_all_markers();
}

draw_map();
draw_markers();
show_all_markers();
L.DomEvent.disableClickPropagation(L.DomUtil.get('filter-box'));
L.DomEvent.disableClickPropagation(L.DomUtil.get('back'));
draw_scene();
draw_hover_line();
