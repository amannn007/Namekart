import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { fetchSpotifyData } from '../spotifyService';
import { Box, Card, Typography, Select, MenuItem, FormControl, InputLabel, Container, Grid, CircularProgress } from '@mui/material';
import styled from 'styled-components';

const chartTypes = ['Bar', 'Line', 'Pie'];

const Dashboard = () => {
    const [albums, setAlbums] = useState([]);
    const [songs, setSongs] = useState([]);
    const [selectedChart, setSelectedChart] = useState('Bar');
    const [selectedData, setSelectedData] = useState('albums'); // Can be 'albums' or 'songs'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getAlbums = async () => {
            const data = await fetchSpotifyData('album', 'rock');
            setAlbums(data.albums.items);
        };

        const getSongs = async () => {
            const data = await fetchSpotifyData('track', 'pop');
            setSongs(data.tracks.items);
        };

        setLoading(true);
        Promise.all([getAlbums(), getSongs()]).then(() => setLoading(false));
    }, []);

    useEffect(() => {
        // Clear the chart before redrawing
        d3.select('#chart').selectAll('*').remove();

        const data = selectedData === 'albums' ? albums : songs;

        if (data.length > 0 && !loading) {
            if (selectedChart === 'Bar') {
                drawBarChart(data);
            } else if (selectedChart === 'Line') {
                drawLineChart(data);
            } else if (selectedChart === 'Pie') {
                drawPieChart(data);
            }
        }
    }, [selectedChart, selectedData, albums, songs, loading]);

    const drawBarChart = (data) => {
        const width = 800;
        const height = 500;
        const svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height);

        const padding = { top: 20, right: 30, bottom: 80, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${padding.left},${padding.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, chartWidth])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.popularity || 0)])
            .range([chartHeight, 0]);

        g.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('font-size', '12px'); // Adjust font size

        g.append('g').call(d3.axisLeft(yScale));

        g.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.name))
            .attr('y', d => yScale(d.popularity || 0))
            .attr('width', xScale.bandwidth())
            .attr('height', d => chartHeight - yScale(d.popularity || 0))
            .attr('fill', '#42a5f5')
            .on('mouseover', function () {
                d3.select(this).attr('fill', '#1e88e5');
            })
            .on('mouseout', function () {
                d3.select(this).attr('fill', '#42a5f5');
            });
    };

    const drawLineChart = (data) => {
        const width = 800;
        const height = 500;
        const svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height);

        const padding = { top: 20, right: 30, bottom: 80, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${padding.left},${padding.top})`);

        const xScale = d3.scalePoint()
            .domain(data.map(d => d.name))
            .range([0, chartWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.popularity || 0)])
            .range([chartHeight, 0]);

        g.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('font-size', '12px');

        g.append('g').call(d3.axisLeft(yScale));

        const line = d3.line()
            .x(d => xScale(d.name))
            .y(d => yScale(d.popularity || 0));

        g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', '#ff7043')
            .attr('stroke-width', 2)
            .attr('d', line);
    };

    const drawPieChart = (data) => {
        const width = 500;
        const height = 500;
        const radius = Math.min(width, height) / 2;

        const svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const pie = d3.pie().value(d => d.popularity || 0);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const arcs = svg.selectAll('arc')
            .data(pie(data))
            .enter()
            .append('g')
            .attr('class', 'arc');

        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => color(d.data.name));
    };

    return (
        <Container>
            <Typography variant="h4" align="center" gutterBottom>
                Spotify Dashboard
            </Typography>

            <Grid container spacing={3} justifyContent="center" alignItems="center">
                {/* Dropdown for Chart Type */}
                <Grid item xs={12} md={4}>
                    <CardStyled>
                        <FormControl fullWidth>
                            {/* <InputLabel id="chart-select-label">Select Chart Type</InputLabel> */}
                            <Select
                                labelId="chart-select-label"
                                id="chart-select"
                                value={selectedChart}
                                onChange={(e) => setSelectedChart(e.target.value)}
                                style={{ zIndex: 2 }}  // Added zIndex to fix overlay issue
                            >
                                {chartTypes.map((chartType) => (
                                    <MenuItem key={chartType} value={chartType}>
                                        {chartType}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </CardStyled>
                </Grid>

                {/* Dropdown for Data Type */}
                <Grid item xs={12} md={4}>
                    <CardStyled>
                        <FormControl fullWidth>
                            {/* <InputLabel id="data-select-label">Select Data Type</InputLabel> */}
                            <Select
                                labelId="data-select-label"
                                id="data-select"
                                value={selectedData}
                                onChange={(e) => setSelectedData(e.target.value)}
                                style={{ zIndex: 1 }}  // Ensuring different zIndex for correct stacking
                            >
                                <MenuItem value="albums">Albums</MenuItem>
                                <MenuItem value="songs">Songs</MenuItem>
                            </Select>
                        </FormControl>
                    </CardStyled>
                </Grid>
            </Grid>

            {/* Loading State */}
            {loading ? (
                <Box mt={5} p={3} display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress />
                </Box>
            ) : (
                <Box mt={5} p={3} boxShadow={3} bgcolor="white" borderRadius={2}>
                    <Typography variant="h6" align="center" gutterBottom>
                        {selectedChart} Chart of {selectedData}
                    </Typography>
                    <div id="chart"></div>
                </Box>
            )}
        </Container>
    );
};

const CardStyled = styled(Card)`
    padding: 16px;
`;

export default Dashboard;
