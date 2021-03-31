(function () {

    let DATASET = null
    let LINKSET = null

    d3.json("https://kjjejones44.github.io/api/gs.json").then(result => {
        DATASET = result;
        drawPage();
    })

    d3.json("https://kjjejones44.github.io/api/links.json").then(result => {
        LINKSET = result;
        drawPage();
    })

    const generate_domain = (func) => [d3.min(DATASET, func), d3.max(DATASET, func)]

    function drawPage() {
        if (!DATASET || !LINKSET) return
        const vh = window.innerHeight / 100
        const padding = vh * 5
        const height = window.innerHeight - 4 * vh 
        const width = window.innerWidth - 2 * vh

        const chart = document.getElementById("chart");
        while (chart.firstChild) chart.removeChild(chart.firstChild);

        var zoom = d3.zoom()
            .scaleExtent([1, 5])
            .translateExtent([[-width / 4, -height / 4], [width * 1.25, height * 1.25]])
            .on("zoom", () => {                
                const t = d3.event.transform
                container.attr("transform", `translate(${t.x},${t.y})scale(${t.k})`);
            });
        
        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .call(zoom)

        const svg_box = svg.node().getBoundingClientRect()

        var container = svg.append("g")
            .attr("id", "container")
            .attr("transform", "translate(0,0)scale(1,1)");

        const xScale = d3.scaleLinear()
            .domain(generate_domain(d => d.cx))
            .rangeRound([padding, svg_box.width - padding]);

        const yScale = d3.scaleLinear()
            .domain(generate_domain(d => d.cy))
            .rangeRound([padding, svg_box.height - padding]);

        const cScale = d3.scaleSequential(d3.interpolateOranges)
            .domain(generate_domain(d => d.pop))

        const rScale = d3.scaleLinear()
            .domain(generate_domain(d => d.r))
            .rangeRound([1, Math.min(height, width) / 30]);

        const div = document.querySelector("div.tooltip") ?
            d3.select("div.tooltip") :
            d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        container.append("g")
            .selectAll("line")
            .data(LINKSET)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]['x']))
            .attr("y1", d => yScale(d[0]['y']))
            .attr("x2", d => xScale(d[1]['x']))
            .attr("y2", d => yScale(d[1]['y']))

        container.append("g")
            .selectAll("circle")
            .data(DATASET)
            .enter()
            .append("a")
            .attr("href", d => `http://www.reddit.com/r/${d.id.trim()}`)
            .attr("target", "_blank")
            .append("circle")
            .attr("cx", d => xScale(d.cx))
            .attr("cy", d => yScale(d.cy))
            .attr("r", d => rScale(d.r))
            .attr("fill", d => cScale(d.pop))
            .on("mouseenter", d => {
                div.html(`<strong>${d.id}</strong>`)
                const rect = d3.event.target.getBoundingClientRect()
                const top = rect.top - div.node().offsetHeight 
                const left = (rect.left + rect.width / 2) - div.node().offsetWidth / (svg_box.width / rect.left)
                div.style("top", `${top}px`).style("left", `${left}px`).style("opacity", 1)
            })
            .on("mouseout", () => div.style("opacity", 0))
    };
    window.addEventListener('resize', drawPage);
})()