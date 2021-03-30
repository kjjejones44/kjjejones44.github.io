(function () {
    let DATASET = null
    d3.json("https://kjjejones44.github.io/api/gs.json").then(result => {
        DATASET = result;
        drawPage();
    })

    function drawPage() {
        const padding = 60;
        const h = Math.min(window.innerHeight, window.innerWidth) - padding;
        const w = Math.max(window.innerWidth - padding, h);

        const chart = document.getElementById("chart");
        while (chart.firstChild) chart.removeChild(chart.firstChild);

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        const xScale = d3.scaleLinear()
            .domain([d3.min(DATASET, d => d.cx), d3.max(DATASET, d => d.cx)])
            .range([1.5 * padding, w - padding]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(DATASET, d => d.cy), d3.max(DATASET, d => d.cy)])
            .range([h - padding, padding]);

        const cScale = d3.scaleSequential(d3.interpolateOranges)
            .domain([d3.min(DATASET, d => d.pop), d3.max(DATASET, d => d.pop)]);

        const rScale = d3.scaleLinear()
            .domain([d3.min(DATASET, d => d.r), d3.max(DATASET, d => d.r)])
            .range([1, Math.min(h, w) / 30]);

        const div = d3.select("div.tooltip").node() ?
            d3.select("div.tooltip") :
            d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll("circle")
            .data(DATASET)
            .enter()
            .append("a")
            .attr("xlink:href", d => `http://www.reddit.com/r/${d.id.trim()}`)
            .attr("target", "_blank")
            .append("circle")
            .attr("cx", d => xScale(d.cx))
            .attr("cy", d => yScale(d.cy))
            .attr("r", d => rScale(d.r))
            .attr("fill", d => cScale(d.pop))
            .on("mouseover", d => {
                const tooltip = document.querySelector(".tooltip:last-of-type")
                const top = d3.event.pageY - tooltip.offsetHeight
                const left = d3.event.pageX - tooltip.offsetWidth * ((d3.event.pageX - 2 * padding) / (w - 2.5 * padding))
                div
                    .style("opacity", 1)
                    .html(`<strong>${d.id}</strong>`)
                    .style("top", `${top}px`)
                    .style("left", `${left}px`)
            })
            .on("mouseout", () => div.style("opacity", 0));
    };
    window.addEventListener('resize', drawPage);
})()