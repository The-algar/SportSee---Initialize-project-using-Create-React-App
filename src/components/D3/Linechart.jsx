// //@ts-check

import * as d3 from 'd3'
import { select } from 'd3'
import React, { useRef } from 'react'
import styled from 'styled-components'
import { useD3 } from '../../utils/hooks/useD3'
import PropTypes from 'prop-types'

/**
 * @name LineChart A Linear chart showing the user average session length. Filled by D3.js.
 * @param {Object} props - props component
 * @param {Array<Object>} props.data - user data
 * @hook useD3 : hook filtering data, Id and renderChartFn draw the svg of the chart while including responsive dimensions with resize observer
 * @function LineChart Draw the svg Line chart with D3.js
 * @returns {JSX} : a Radial Pie Chart
 * @component
*/

const Wrapper = styled.div`
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    vertical-align: top;
    overflow: hidden;
    background: #FBFBFB;
    border-radius: 5px;
`
const WrapperRefSvg = styled.div`
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
`

export default function LineChart({ data }) {
  const svgRef = useRef()
  const wrapperRef = useD3(svgRef, data, (dimensions) => {
    
    // console.log('userData', data);
    // console.log('svgDimensions :', dimensions);

    if (!dimensions) return

    const margin = { top: 30, left: 20, bottom: 30, right: 20 };
    const width = (dimensions.width -margin.left -margin.right);
    const height = (dimensions.height -margin.top -margin.bottom);

    // console.log('width :', dimensions.width);
    // console.log('height :', dimensions.height);
	
    const dayInitMaj = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
	
    // console.log('dayInitMaj :', dayInitMaj)


	// append the svg object to the body of the page
    const svg = select(svgRef.current)
    .append("svg")
    .classed(WrapperRefSvg, true)
    .attr('width', width +margin.left +margin.right)
    .attr('height', height +margin.top +margin.bottom )
    .append("g")
		// add a title
		svg.append('text')
		.attr('fill', '#fff')
		.attr('x', margin.right)
		.attr('y', margin.top)
		.text('Durée moyenne des sessions')
		.style('font-size', '1rem')
      	.style('font-weight', '700')

		// X axis
		const x = d3.scaleBand()
			.domain(data?.average?.sessions.map(d => d.day)) //d => dayInitMaj[d.day]
			.range([0, width +margin.left+margin.right])
		svg.append("g")
    //send the x Axis to the bottom of the chart .tickFormat((value, dayInitMaj) => dayInitMaj + 1) .tickFormat((d) => dayInitMaj.indexOf[d.day]))
    .attr("transform",`translate(0, ${height +margin.top -margin.bottom} )`)
		.call(d3.axisBottom(x).tickSize(10).tickPadding([10]).tickFormat((d) => dayInitMaj[d -1]))
    .attr("stroke-width", 0)
    .style("color", "#fff")
    .style("font-weight", "500") 
    .style("font-size","12px")

		 //Add Y Axis ( not visible)
    const y = d3.scaleLinear()
      // .domain(d3.extent(data?.average?.sessions, function(d){return d.sessionLength}))
      .domain([0, d3.max(data?.average?.sessions, (d) => d.sessionLength)])
      // .range([margin.top, height +margin.top +margin.bottom ])
      .range([height, margin.top + margin.bottom])

    svg.append("g")
      // .call(d3.axisLeft(y).ticks(0)).attr("stroke-width",0)
    .call(d3.axisLeft(y).ticks(0)).attr("stroke-width",0)
      .attr('color', '#fff')
      .attr('transform', `translate(0, ${height + margin.top})`)
      .attr('font-size', '1rem')
      .select('.domain')
      .remove()

	//tooltips
    // Just to be sure a tooltip don't go outside the chart
      function displayTooltip(index) {
        if (x(index) <= width -margin.left -margin.right)
          return x(index)
        else return x(index) -margin.left -margin.right
      }
		  data?.average?.sessions.forEach((session, index) => {
			const day = session.day
			let group = svg.append('g').attr('id', 'day' + index + 'average')
      .attr("transform",`translate(${margin.right}, 0)`)
			group
				.append('rect')
				.attr('x', x(day))
				.attr('y', 0)
				.attr('width', '100%')
				.attr('height', height + margin.top + margin.bottom)
				.attr('fill', 'rgba(0, 0, 0, 0.2)')
				.attr('opacity', '0')
			group
				.append('rect')
				.attr('x', displayTooltip(day))
				.attr('y', y(session.sessionLength) - 25)
				.attr('width', 50)
				.attr('height', 20)
				.attr('fill', '#fff')
				.attr('opacity', '0')
			group
				.append('text')
				.attr('x', displayTooltip(day) + 25)
				.attr('y', y(session.sessionLength -1) - 10)
				.style('text-anchor', 'middle')
				.attr('fill', 'black')
				.text(`${session.sessionLength} min`)
				.attr('opacity', '0')
			group
				.append('circle')
				.attr('fill', '#fff')
				.attr('cx', x(day))
				.attr('cy', y(session.sessionLength))
				.attr('r', 4)
				.attr('opacity', '0')
			group
				.append('circle')
				.classed('low-opacity-circle', true)
				.attr('fill', '#fff')
				.attr('cx', x(day))
				.attr('cy', y(session.sessionLength))
				.attr('r', 10)
				.attr('opacity', '0')
			// hover area
			svg.append('rect')
				.attr('x', x(day))
				.attr('y', 0)
				.attr('width', width / 7)
				.attr('height', height)
				.attr('fill', 'transparent')
				.attr('opacity', '1')
				// make it appear on hover + make the infos appears
				.on('mouseover', function () {
					d3.selectAll(`#day${index}average > *`)
						.transition()
						.attr('opacity', '1')
					d3.selectAll(`#day${index}average > .low-opacity-circle`)
						.transition()
						.attr('opacity', '.3')
				})
				.on('mouseout', function () {
					d3.selectAll(`#day${index}average > *`)
						.transition()
						.attr('opacity', '0')
				})

        
    // Add the line
          svg.append("path")
            .datum(data?.average?.sessions)
            .attr("transform",`translate(${margin.right}, 0)`)
            .attr("fill", "none")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
              .curve(d3.curveMonotoneX) //curveCatmullRom
              .x(function(d) { return x(d.day)})
              // .x(function(d) { return x(tickLabels.indexOf(d.day))})
              .y(function(d) { return y(d.sessionLength)})
              )
		})
	})     
  return (
    <Wrapper ref={wrapperRef}>
      <svg ref={svgRef} style={{ height: '100%', width: '100%', backgroundColor: '#FF0000', borderRadius: '5px'}}> 
      </svg>
    </Wrapper>
  )
}

LineChart.propTypes={
  sessions : PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.number,
      sessionLength: PropTypes.number,
    })
  )
}