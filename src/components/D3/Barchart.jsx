// //@ts-check

import * as d3 from 'd3'
import { select } from 'd3'
import React, { useRef } from 'react'
import styled from 'styled-components'
import { useD3 } from '../../utils/hooks/useD3'
import PropTypes from 'prop-types'

/**
 * A Bar chart showing the user weight and calories burned. Filled by D3.js.
 * 
 * @name BarChart
 * @param {Object} props - props component
 * @param {Array<Object>} props.data - user data
 * @param {number} props.dimensions - height of svg container
 * @returns {JSX}
 * @component
*/

export default function Barchart({ data }) {
  const svgRef = useRef()
  const wrapperRef = useD3(svgRef, data, (dimensions) => {
    
    // console.log('userData', data);
    // console.log('svgDimensions :', dimensions);

    if (!dimensions) return

    const margin = { top: 0, right: 30, bottom: 50, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const svg = select(svgRef.current)
    .append("svg")
      .classed('barChart-svg', true)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)

    // // List of subgroups = header of the activity sessions = calories and weight data here
    const subgroups = ['kilogram', 'calories'];

    // List of groups = activities here = value of the first column called group -> I show them on the X axis
    const groups = data?.activity?.sessions.map(d => d.day)

    // console.log('Data Group:', groups)

    // Add X axis
    const xAxis = d3.scaleBand()
      .domain(groups)
      .range([0, width +margin.left +margin.right])
      .padding([0.6])

    svg.append("g")
      //send the xAxis to the bottom of the chart
      .attr("transform",`translate(0,${height - margin.bottom})`)
      .attr("stroke-opacity", '0.3')
      .attr("stroke-width",'0')
      .style('font-size', '0.75rem')

      .call(d3.axisBottom(xAxis)
      .tickSize(0)
      .tickFormat((value, index) => index + 1)
      .tickPadding([8])
      )

    //calculating the min and max value of our data elements
    const minMaxKg = d3.extent(data?.activity?.sessions, d => d.kilogram)
		// eslint-disable-next-line no-unused-vars
		const minMaxCal = d3.extent(data?.activity?.sessions, d => d.calories)

    // console.log('kilogram:', minMaxKg)
    // console.log('calories:', minMaxCal)

    // eslint-disable-next-line no-unused-vars
    const minY = d3.min(data?.activity?.sessions, d => d.kilogram)
		const maxY = d3.max(data?.activity?.sessions, d => d.calories)

    // console.log('kilogram:', minY)
    // console.log('calories:', maxY)

    // Axe vertical
    //create y scale, to build the y axis of the group data
    const yScale = d3.scaleLinear()
      .domain( minMaxKg)
      .range([height -margin.bottom -margin.top, 5 ])
    
    //create the y axis
    const formatyAxis = d3.format('~');
    const yAxis = d3.axisRight(yScale)
      .tickFormat(formatyAxis)
      .ticks(3)
      .tickSize(margin.right-width)
      .tickPadding([30])

    //append it to the first svg
    //position it to the right and ticks on the left inside with the transform attributes 
    svg.append('g')
      .call(yAxis)
      .attr('transform', `translate(${width + margin.left - margin.right}, 0)`)
      .attr('opacity', '0.4')
      .attr('stroke-dasharray',("3, 3"))
      .style('font-size', '0.75rem')
      
    //remove the yAxis line 
      // .select('.domain').attr('stroke-width', 0) // fonctionne aussi
      .select('path').remove()

    //create the second x axis line
    const x2Axis = d3.axisBottom(yScale.range([margin.left, width  +margin.right]))
      .tickValues([])
      .ticks(0)
      .tickSize(0)

    //append the plain line to the svg and position it over the first x Axis
    svg.append('g')
      .call(x2Axis)
      .attr('transform', `translate(0, ${height -margin.bottom})`) // - margin.top
      .attr("stroke-opacity", '1')
      .attr("stroke-width",'1')

    //create a second x scale for subgroup position
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .range([0, xAxis.bandwidth()])
      .padding([0.5])
    
    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#020203','#FF0101']);
      
    // create a second y scale for the biggest bar (the biggest one) to fit the height of our SVG container
    const ySubgroup = d3.scaleLinear()
      .domain([0, (maxY)*1.4]) //*1.4
      .range([0, height]) 

    // // Just to be sure a tooltip don't go outside the chart
		// function displayTooltip(index) {
		// 	if(xAxis(index) <= width -margin.left -margin.right) 
		// 		return xAxis(index)
		// 	else 
		// 		return xAxis(index) -100
		// }
    // Tooltips and Tooltip Area
    data?.activity?.sessions.forEach((d, index) => { 
			let toolTip = svg.append("g")
				.attr("id", `day${index + 1}`)
    
    // create gray rectangles for hover
			toolTip.append("rect")
				.attr("x", xAxis(d.day))
				.attr("y", margin.top)
        .attr("width", xAxis.bandwidth())
        .attr("height", height -margin.bottom -margin.top)
				.attr('fill', 'gray')
				.attr("opacity", "0")

      // make it appear on hover + make the infos appears
				.on("mouseover", function () {
					d3.select(this).transition()
						.duration('200')
						.attr("opacity", ".2")
					d3.selectAll(`#day${index + 1} > *:not(:first-child)`).transition()
            .attr('transform', `translate(${xAxis(d.day) +margin.left}, 0)`) //+margin.right
						.duration('200')
						.attr("opacity", "1")
					})
				.on("mouseout", function () {
					d3.select(this).transition()
						.duration('200')
						.attr("opacity", "0")
					d3.selectAll(`#day${index+1} > *:not(:first-child)`).transition()
						.attr("opacity", "0")
					})
          // infos bubble 
        toolTip.append("rect")
          .attr("x", xAxis(index+1))
          .attr("y", 20)
          .attr("width", 39)
          .attr("height", 70)
          .attr("opacity", "0")
          .attr('fill', 'red')
        toolTip.append("text")
          .attr("x", xAxis(index+1))
          .attr("y", 45)
          .attr("dx", 7.5)
          .text(d.kilogram + "Kg")  
          .style("text-anchor", "start")
          .style("font-size", "10px")
          .style('fill', '#fff')
          .attr("opacity", "0")
        toolTip.append("text")
          .attr("x", xAxis(index+1))
          .attr("y", 75)
          .attr("dx", 2.5)
          .text(d.calories + "Kcal")   
          .style("text-anchor", "start")
          .style("font-size", "10px")
          .style('fill', '#fff')   
          .attr("opacity", "0")
        })

     // Adding rounded tips of bars
    data?.activity?.sessions.forEach((d, index) => { 
			let barTip = svg.append("g")
				.attr("id", `day${index + 1}`)
    
    // Creating circles
    barTip.append("g")
    // Show the tip
    .selectAll('g')
    .data(data?.activity?.sessions)
    .join('g')
    .attr("transform", d => `translate(${xAxis(d.day)}, ${-margin.top -margin.bottom})`)
    .selectAll('circle')
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .join('circle')
    .attr('cx', d => xSubgroup(d.key) + 4)
    .attr('cy', d => height-ySubgroup(d.value))
    .attr('r', 3.5)
    .attr('fill', d => color(d.key))
    })

    // append the svg object to the body of the page
    svg.append('g')
    // Show the bars
    .selectAll('g')
    // Enter in data = loop group per group
    .data(data?.activity?.sessions)
    .join('g')
    .attr("transform", d => `translate(${xAxis(d.day)}, ${-margin.top -margin.bottom})`)
    .selectAll('rect')
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .join('rect')
    .attr('x', d => xSubgroup(d.key))
    .attr('y', d => height-ySubgroup(d.value))
    .attr('width', '8' ) //xSubgroup.bandwidth()
    .attr('height', d => ySubgroup(d.value))
    .attr('fill', d => color(d.key))
})

  return (
    // <div ref={wrapperRef.current ? d3.select('.barChart-svg').remove() : wrapperRef.current = true}>
    <Wrapper ref={wrapperRef}>
      <Head>
        <Title>Activité quotidienne</Title>
        <Legend>
          <Info>
            <Icon color='#282D30' />
            <Text>Poids (kg)</Text>
          </Info>
          <Info>
            <Icon color='#E60000' />
            <Text>Calories brûlées (kCal)</Text>
          </Info>
          </Legend>
      </Head>
      <svg ref={svgRef} style={{ height: '100%', width: '100%' }}> 
      </svg>
    </Wrapper>
  )}

Barchart.propTypes={
  activity : PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      kilogram: PropTypes.number.isRequired,
      calories:PropTypes.number.isRequired
    })
  )
}

const Wrapper = styled.div`
    background: #FBFBFB;
    height: 20rem;
    border-radius: 5px;
    @media (max-width: 968px) {
      height: 15rem;
    }
`
const Head = styled.div`
    display: flex;
    justify-content: space-around;
    margin: 1rem 1.5rem 1rem 1.5rem;
    padding-top: 0; 1.5rem;
    @media (max-width: 968px) {
      margin: 1rem 1.5rem 1rem 1.5rem;
    }
	`

const Title= styled.h2`
    font-size: 18px;
    line-height: 24px;
    color: #20253A;
    @media (max-width: 968px) {
      font-size: 15px;
    }
`

const Text = styled.p`
	font-weight: 500;
	font-size: 14px;
	color: #74798c;
	margin-left: 10px;
`

const Icon = styled.div`
	height: 8px;
	width: 8px;
	border-radius: 50%;
	background-color: ${(props) => props.color};
	align-self: center;
	margin-left: 30px;
`

const Legend = styled.div`
	display: flex;
`

const Info = styled.div`
    display: flex;
    align-items:center;
`