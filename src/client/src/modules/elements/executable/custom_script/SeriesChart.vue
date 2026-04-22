<template>
  <v-chart :style="{height: `${styleHeight*10}vh`}" :option="finalOption" autoresize></v-chart>
</template>

<script>
    import Vue from 'vue';
    import VueCompositionAPI from '@vue/composition-api';
    Vue.use(VueCompositionAPI);
    import ECharts from 'vue-echarts';
    import { use } from 'echarts/core';
    import { CanvasRenderer } from 'echarts/renderers';
    import { LineChart } from 'echarts/charts';
    import {
        GridComponent,
        TooltipComponent,
        TitleComponent,
        LegendComponent,
        DataZoomComponent,
        MarkLineComponent
    } from 'echarts/components';

    use([
        CanvasRenderer,
        LineChart,
        GridComponent,
        TooltipComponent,
        TitleComponent,
        LegendComponent,
        DataZoomComponent,
        MarkLineComponent
    ]);

    export default {
        name: 'SeriesChart',
        components: { 'v-chart': ECharts },
        props: {
            seriesName: {
                type: String,
                required: true
            },  
            seriesUrl: {
                type: String,
                default: ''
            },
            styleHeight: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                fileData: null,
                option: {
                    tooltip: { trigger: 'axis' },
                    legend: { bottom: 0, type: 'scroll', orient: 'horizontal' },
                    grid: { left: '8%', right: '8%', top: 50, bottom: 120 },
                    dataZoom: [
                        { type: 'slider', start: 0, end: 100, bottom: 48, height: 24 },
                        { type: 'inside', start: 0, end: 100 }
                    ],
                    xAxis: {
                        type: 'time',
                        axisLabel: {
                            formatter: (value) => {
                                const d = new Date(value);
                                return `${d.getHours()}:${d.getMinutes().toString().padStart(2,'0')}`;
                            },
                            hideOverlap: true
                        }
                    },
                    yAxis: { type: 'value'}
                }
            };
        },
        created() {
            this.fetchSeriesData(this.seriesUrl);
        },  
        watch: {
            seriesUrl(newUrl) {
                this.fetchSeriesData(newUrl);
            }
        },
        computed: {
            getSeriesData() {
                const data = (this.fileData && this.fileData[this.seriesName]) || {};
                return { series_output: data };
            },

            // legends
            getLegends() {
                const series = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                return series
                    .filter(s => s.series_type === 'HORIZONTAL')
                    .map(s => s.name);
            },

            // build line series, converting DOY timestamps
            lineSeries() {
                const series = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                return series
                    .filter(s => s.series_type === 'HORIZONTAL')
                    .map(s => ({
                        name: s.name,
                        type: 'line',
                        smooth: false,
                        showSymbol: true,
                        symbol: 'circle', 
                        lineStyle: { width: 2, color: s.color },
                        itemStyle: { color: s.color },
                        data: s.data.map(([t, v]) => [this.doyToISO(t), v]),
                        zlevel: 2
                }));
            },

            // compute global x extent (min from horizontal series, max from vertical series if present)
            xExtent() {
                // collect all horizontal times
                const horizTimes = [];
                this.lineSeries.forEach(s => {
                    s.data.forEach(d => {
                        const t = d && d[0];
                        if (t) {
                            const ms = (new Date(t)).getTime();
                            if (!Number.isNaN(ms)) horizTimes.push(ms);
                        }
                    });
                });

                // collect vertical event times (if any)
                const seriesAll = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                const verticalSeries = seriesAll.find(s => s.series_type === 'VERTICAL');
                const verticalTimes = [];
                if (verticalSeries && Array.isArray(verticalSeries.data)) {
                    verticalSeries.data.forEach(([t, label]) => {
                        const iso = this.doyToISO(t);
                        const ms = (new Date(iso)).getTime();
                        if (!Number.isNaN(ms)) verticalTimes.push(ms);
                    });
                }

                // if we have no horizontal times at all, but we have vertical times, use vertical min as min too
                const allHorizExist = horizTimes.length > 0;
                if (!allHorizExist && verticalTimes.length === 0) return null;
                const minMs = allHorizExist ? Math.min(...horizTimes) : Math.min(...verticalTimes);
                // IMPORTANT: use max from verticalTimes if present, otherwise use max of horizontal times
                const maxMs = (verticalTimes.length > 0) ? Math.max(...verticalTimes) : Math.max(...horizTimes);

                return {
                    min: new Date(minMs).toISOString(),
                    max: new Date(maxMs).toISOString()
                };
            },

            // collect vertical events and turn into markLine data
            eventMarkLines() {
                const ev = this.getSeriesData.series_output.series.find(s => s.series_type === 'VERTICAL');
                if (!ev) return null;
                return {
                    symbol: ['none', 'none'],
                    lineStyle: { color: ev.color || '#FF0000', width: 2, type: 'dashed' },
                    label: {
                        show: true,
                        formatter: p => p.name,
                        position: 'insideEndBottom',
                        rotate: 90,
                        fontSize: 12,
                        color: ev.color || '#FF0000',
                        fontWeight: 'bold'
                    },
                    data: ev.data.map(([t, label]) => ({ name: label, xAxis: this.doyToISO(t) })),
                    z: 10
                };
            },

            // baseline series: horizontal line at y=0 across [xMin, xMax], transparent color
            baselineSeries() {
                if (!this.xExtent) return null;
                const baseline = {
                    name: '__baseline__',
                    type: 'line',
                    data: [
                        [this.xExtent.min, 0],
                        [this.xExtent.max, 0]
                    ],
                    showSymbol: false,
                    lineStyle: { width: 0, type: 'solid', color: '#transparent' },
                    itemStyle: { opacity: 0 },
                    zlevel: 0,
                    markLine: this.eventMarkLines ? { ...this.eventMarkLines } : undefined,
                    tooltip: { show: false }
                };
                return baseline;
            },

            // final series array: include baseline first (so it appears underneath), then the real series
            seriesWithEvents() {
                const lines = this.lineSeries || [];
                // include baseline (underneath) if available
                const result = [];
                if (this.baselineSeries) result.push(this.baselineSeries);
                if (lines.length > 0) result.push(...lines);
                return result;
            },

            // option used by the chart
            finalOption() {
                return {
                    ...this.option,
                    legend: {
                        ...this.option.legend,
                        data: this.getLegends
                    },
                    series: this.seriesWithEvents
                };
            }
        },
        methods: {
            // helper: convert "YYYY-DOYThh:mm:ss.SSS" to JS Date/ISO string
            doyToISO: function(doyStr) {
                const [ymd, timeRaw] = doyStr.split('T') || [];
                const [yearStr, doyStrOnly] = (ymd || '').split('-') || [];
                const year = parseInt(yearStr, 10);
                const doy = parseInt(doyStrOnly, 10);
                if (!year || !doy) return doyStr; // fall back
                const base = new Date(Date.UTC(year, 0, 1));
                const date = new Date(base.getTime() + (doy - 1) * 24 * 3600 * 1000);
                const time = (timeRaw || '00:00:00.000').replace(/(\.\d{3})\d+$/, '$1');
                const iso = `${date.toISOString().slice(0,10)}T${time}Z`;
                return iso;
            },
            fetchSeriesData: function(url) {
                if (!url) return;
                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        this.fileData = data;
                    })
                    .catch(err => console.error("Error fetching file:", err));
            }

        }
    };
</script>
