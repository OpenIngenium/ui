<template>
  <v-chart :style="{ height: `${styleHeight * 10}vh` }" :option="finalOption" autoresize></v-chart>
</template>

<script>
/**
 * SeriesChart — time-series with millisecond precision
 *
 * X-Axis: always 'time'
 * Input handling:
 *  - If getSeriesData.series_output.timetype === 'SCLK' → DO NOT convert x values; use as-is
 *    (formatters multiply by 1000 only for display)
 *  - Else (normal time): coerce to epoch ms (supports DOY "YYYY-DOYThh:mm:ss.SSS...", ISO, epoch ms, epoch sec)
 *
 * NOTE: ECharts 'time' axis expects ms timestamps.
 */

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
        MarkLineComponent,
        ToolboxComponent
    } from 'echarts/components';

    use([
        CanvasRenderer,
        LineChart,
        GridComponent,
        TooltipComponent,
        TitleComponent,
        LegendComponent,
        DataZoomComponent,
        MarkLineComponent,
        ToolboxComponent
    ]);

    export default {
        name: 'SeriesChart',
        components: { 'v-chart': ECharts },

        props: {
            seriesName: { type: String, required: true },
            seriesUrl:   { type: String, default: '' },
            styleHeight: { type: Number, default: 2 }
        },

        data() {
            return {
                fileData: null,
                sclkFracPrec: 0,
                option: {
                    axisPointer: {
                        link: [{ xAxisIndex: 'all' }],
                        label: {
                            show: true,
                            formatter: (p) => p.axisDimension === 'x'
                                ? this.axisXFormatterForPointer(p.value)
                                : p.value
                        }
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: (items) => {
                            if (!items || !items.length) return '';
                            const x = +items[0].axisValue;
                            const header = this.tooltipHeaderFormat(x);
                            const lines = items.map(item => {
                                const val = (item.data && Array.isArray(item.data)) ? item.data[1] : item.value; //data:[ 1761066570.9066296,4]
                                return `${item.marker}${item.seriesName}: ${val}`;
                            });
                            return [header, ...lines].join('<br/>');
                        }
                    },
                    legend: { bottom: 0, type: 'scroll', orient: 'horizontal' },
                    grid:   { left: '8%', right: '8%', top: 50, bottom: 120 },
                    toolbox: {
                        show: true,
                        right: 20,
                        feature: {
                            saveAsImage: {
                                show: true,
                                title: 'Save as Image',
                                type: 'png',
                                name: 'series_chart',
                                backgroundColor: '#fff',
                                pixelRatio: 2
                            }
                        }
                    },
                    dataZoom: [
                        { type: 'slider', start: 0, end: 100, bottom: 48, height: 24 },
                        { type: 'inside', start: 0, end: 100 }
                    ],
                    // xAxis/yAxis are finalized in finalOption()
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

            isSclk() {
                const tt = this.getSeriesData.series_output && this.getSeriesData.series_output.timetype;
                return String(tt).toUpperCase() === 'SCLK';
            },

            getLegends() {
                const series = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                return series
                    .filter(s => s.series_type === 'HORIZONTAL')
                    .map(s => s.name);
            },

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
                        // IMPORTANT: For SCLK, keep x AS-IS (no conversion)
                        data: s.data.map(([t, v]) => [this.isSclk ? Number(t) : this.toEpochMs(t), v]),
                        zlevel: 2
                }));
            },

            xExtent() {
                const times = [];
                this.lineSeries.forEach(s => {
                    s.data.forEach(d => {
                        const t = d && d[0];
                        if (Number.isFinite(t)) times.push(t);
                    });
                });

                const seriesAll = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                const verticalSeries = seriesAll.find(s => s.series_type === 'VERTICAL');
                if (verticalSeries && Array.isArray(verticalSeries.data)) {
                    verticalSeries.data.forEach(([t]) => {
                        const x = this.isSclk ? Number(t) : this.toEpochMs(t);
                        if (Number.isFinite(x)) times.push(x);
                    });
                }

                if (times.length === 0) return null;
                return { min: Math.min(...times), max: Math.max(...times) };
            },

            eventMarkLines() {
                const evSeriesAll = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                const ev = evSeriesAll.find(s => s.series_type === 'VERTICAL');
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
                    data: ev.data.map(([t, label]) => ({
                        name: label,
                        // IMPORTANT: For SCLK, keep x AS-IS (no conversion)
                        xAxis: this.isSclk ? Number(t) : this.toEpochMs(t)
                    })),
                    z: 10
                };
            },

            baselineSeries() {
                if (!this.xExtent) return null;
                return {
                    name: '__baseline__',
                    type: 'line',
                    data: [
                        [this.xExtent.min, 0],
                        [this.xExtent.max+1, 0] //+1 added to ensure that x axist extends a tiny bit more than max value fo line series
                    ],
                    showSymbol: false,
                    lineStyle: { width: 0, type: 'solid', color: '#transparent' },
                    itemStyle: { opacity: 0 },
                    zlevel: 0,
                    markLine: this.eventMarkLines ? { ...this.eventMarkLines } : undefined,
                    tooltip: { show: false }
                };
            },

            seriesWithEvents() {
                const lines = this.lineSeries || [];
                const result = [];
                if (this.baselineSeries) result.push(this.baselineSeries);
                if (lines.length > 0) result.push(...lines);
                return result;
            },

            finalOption() {
                const xAxis = {
                    type: 'time',
                    axisLabel: {
                        formatter: (v) => this.isSclk ?  this.formatSclkRaw(+v) : this.formatUtc(+v),
                        hideOverlap: true
                    }
                };

                return {
                    ...this.option,
                    legend: { ...this.option.legend, data: this.getLegends },
                    xAxis,
                    yAxis: { type: 'value' },
                    series: this.seriesWithEvents
                };
            }
        },

        methods: {
            /* ---------- Axis/Tooltip formatting helpers ---------- */
            axisXFormatterForPointer(value) {
                return this.isSclk ? this.formatSclkRaw(+value) : this.formatUtc(+value);
            },
            tooltipHeaderFormat(x) {
                return this.isSclk ? this.formatSclkRaw(+x) : this.formatUtc(+x);
            },

            formatUtc(ms) {
                if (!Number.isFinite(ms)) return '';
                const d = new Date(ms);
                const pad = (n, w = 2) => String(n).padStart(w, '0');
                return `${d.getUTCHours()}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}Z`;
            },

            /* ---------- Time coercion for non-SCLK ---------- */
            toEpochMs(t) {
                // Already number (assume ms)
                if (typeof t === 'number' && Number.isFinite(t)) return t;

                // Numeric strings → epoch ms or sec
                if (typeof t === 'string' && /^[0-9]+$/.test(t)) {
                    if (t.length >= 13) return Number(t);          // epoch ms
                    if (t.length === 10) return Number(t) * 1000;  // epoch sec
                }

                // ISO 8601 etc. (not DOY)
                if (typeof t === 'string' && !/^\d{4}-\d{3}T/.test(t)) {
                    const parsed = Date.parse(t);
                    if (Number.isFinite(parsed)) return parsed;
                }

                // DOY "YYYY-DOYThh:mm:ss.SSS..." → epoch ms
                return this.doyToEpochMs(t);
            },

            doyToEpochMs(doyStr) {
                if (!doyStr) return NaN;
                const [ymd, timeRaw = '00:00:00.000'] = String(doyStr).split('T');
                if (!ymd) return NaN;

                const [yearStr, doyStrOnly] = ymd.split('-');
                const year = parseInt(yearStr, 10);
                const doy = parseInt(doyStrOnly, 10);
                if (!year || !doy) return NaN;

                const base = new Date(Date.UTC(year, 0, 1));
                base.setUTCDate(doy);

                const [h = '0', m = '0', sMs = '0'] = timeRaw.split(':');
                const [s = '0', frac = '0'] = (sMs || '0').split('.');
                const ms = parseInt(String(frac).slice(0, 3).padEnd(3, '0'), 10) || 0;

                base.setUTCHours(+h || 0, +m || 0, +s || 0, ms);
                return base.getTime();
            },

            /* ---------- Data load ---------- */
            fetchSeriesData(url) {
                if (!url) return;
                fetch(url)
                    .then(res => res.json())
                    .then(data => {
                        this.fileData = data;
                        this.initSclkPrecision();
                    })
                    .catch(err => console.error('Error fetching file:', err));
            },
            formatSclkRaw(n) {
                if (!Number.isFinite(n)) return '';
                // Show raw SCLK with observed fractional precision
                return this.sclkFracPrec > 0 ? n.toFixed(this.sclkFracPrec) : String(n);
            },

            initSclkPrecision() {
                this.sclkFracPrec = 0;
                if (!this.isSclk) return;

                const series = (this.getSeriesData.series_output && this.getSeriesData.series_output.series) || [];
                for (const s of series) {
                    if (!Array.isArray(s.data)) continue;
                    for (const [x] of s.data) {
                        const str = String(x);
                        const idx = str.indexOf('.');
                        if (idx >= 0) {
                            const fracLen = str.length - idx - 1;
                            if (fracLen > this.sclkFracPrec) this.sclkFracPrec = fracLen;
                        }
                    }
                }
            }
        }
    };
</script>
