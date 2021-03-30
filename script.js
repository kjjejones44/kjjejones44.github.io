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
        const padding = Math.round(Math.min(window.innerHeight, window.innerWidth) / 30)
        const height = window.innerHeight - padding
        const width = window.innerWidth - padding

        const chart = document.getElementById("chart");
        while (chart.firstChild) chart.removeChild(chart.firstChild);

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const svg_box = svg.node().getBoundingClientRect()

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

        svg.append("g")
            .selectAll("line")
            .data(LINKSET)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]['x']))
            .attr("y1", d => yScale(d[0]['y']))
            .attr("x2", d => xScale(d[1]['x']))
            .attr("y2", d => yScale(d[1]['y']))

        svg.append("g")
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
            .on("mouseover", d => {
                div.html(`<strong>${d.id}</strong>`)
                const top = (yScale(d["cy"]) + svg_box.top - rScale(d["r"]) - div.node().offsetHeight)
                const left = (xScale(d["cx"]) + svg_box.left - (div.node().offsetWidth / (svg_box.width / xScale(d["cx"]))))
                div.style("top", `${top}px`)
                    .style("left", `${left}px`)
                    .style("opacity", 1)
            })
            .on("mouseout", () => div.style("opacity", 0));
    };
    window.addEventListener('resize', drawPage);
})()