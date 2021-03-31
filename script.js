(function () {

    let DATASET, LINKSET, vh, padding, height, width, xScale, yScale, rScale, cScale, zoom, svg, container, lines, div, circles;

    function debounce(func) {
        let timer;
        return event => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(func, 100, event);
        };
    }

    function initialise() {
        if (!DATASET || !LINKSET) return;

        function generate_domain(func) {
            return [d3.min(DATASET, func), d3.max(DATASET, func)]
        };

        xScale = d3.scaleLinear().domain(generate_domain(d => d.cx));
        yScale = d3.scaleLinear().domain(generate_domain(d => d.cy));
        cScale = d3.scaleSequential(d3.interpolateOranges).domain(generate_domain(d => d.pop));
        rScale = d3.scaleLinear().domain(generate_domain(d => d.r));

        zoom = d3.zoom()
            .scaleExtent([1, 5])
            .on("zoom", () => {
                t = d3.event.transform
                container.attr("transform", `translate(${t.x},${t.y})scale(${t.k})`);
            });

        svg = d3.select("#chart")
            .append("svg")
            .call(zoom);

        container = svg.append("g")
            .attr("id", "container")
            .attr("transform", "translate(0,0)scale(1,1)");

        lines = container.append("g")
            .selectAll("line")
            .data(LINKSET)
            .enter()
            .append("line");

        div = d3.select("div.tooltip");

        circles = container.append("g")
            .selectAll("circle")
            .data(DATASET)
            .enter()
            .append("a")
            .attr("href", d => `http://www.reddit.com/r/${d.id.trim()}`)
            .attr("target", "_blank")
            .append("circle")
            .attr("fill", d => cScale(d.pop));

        resizePage();
        addListeners();
    }


    function resizePage() {
        if (!DATASET || !LINKSET) return;

        vh = window.innerHeight / 100;
        padding = vh * 5;
        height = window.innerHeight - 4 * vh;
        width = window.innerWidth - 2 * vh;

        svg.call(zoom.transform, d3.zoomIdentity)
        svg.attr("width", width).attr("height", height);

        zoom.translateExtent([
            [width * -0.25, height * -0.25],
            [width * 1.25, height * 1.25]
        ]);

        const svg_box = svg.node().getBoundingClientRect();
        xScale.rangeRound([padding, svg_box.width - padding]);
        yScale.rangeRound([padding, svg_box.height - padding]);
        rScale.rangeRound([1, Math.min(height, width) / 30]);

        lines.attr("x1", d => xScale(d[0]['x']))
            .attr("y1", d => yScale(d[0]['y']))
            .attr("x2", d => xScale(d[1]['x']))
            .attr("y2", d => yScale(d[1]['y']));

        circles.attr("cx", d => xScale(d.cx))
            .attr("cy", d => yScale(d.cy))
            .attr("r", d => rScale(d.r));

    };

    function addListeners() {
        circles.on("mouseenter", d => {
            div.html(`<strong>${d.id}</strong>`)
            const rect = d3.event.target.getBoundingClientRect()
            const top = rect.top - div.node().offsetHeight
            const left = (rect.left + rect.width / 2) - div.node().offsetWidth / (window.innerWidth / rect.left)
            div.style("top", `${top}px`).style("left", `${left}px`).style("opacity", 1)
        })
        .on("mouseout", () => div.style("opacity", 0))
        .on("auxclick", () => d3.event.stopPropagation())

        svg.on("auxclick", () => d3.event.button == 1 ? svg.call(zoom.transform, d3.zoomIdentity) : null)
    };

    d3.json("https://kjjejones44.github.io/api/gs.json").then(result => {
        DATASET = result;
        initialise();
    })

    d3.json("https://kjjejones44.github.io/api/links.json").then(result => {
        LINKSET = result;
        initialise();
    })

    window.addEventListener('resize', debounce(resizePage));
    
})()