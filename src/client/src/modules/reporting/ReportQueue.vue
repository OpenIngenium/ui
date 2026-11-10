<template>
    <div class="row report-body-spacing">
        <div class="col-md-12">
            <div class="queue-header">
                <h4><i class="glyphicon glyphicon-list"></i> Report Queue</h4>
                <button
                    type="button"
                    class="btn btn-default btn-sm"
                    @click="fetchQueue"
                    :disabled="loading">
                    <i class="glyphicon glyphicon-refresh" :class="{spinning: loading}"></i>
                    Refresh
                </button>
            </div>

            <div v-if="initialLoading" class="empty-state">
                Loading report queue...
            </div>
            <div v-else-if="loadError" class="alert alert-danger">
                Failed to load report queue: {{ loadError }}
            </div>
            <div v-else-if="sortedJobs.length === 0" class="empty-state">
                No jobs in queue.
            </div>
            <table v-else class="table table-striped queue-table">
                <thead>
                    <tr>
                        <th>State</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>User</th>
                        <th>Time</th>
                        <th class="action-col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="job in sortedJobs" :key="job.id">
                        <td>
                            <span class="state-badge" :class="'state-' + job.state">
                                {{ job.state }}
                            </span>
                        </td>
                        <td>{{ job.report_type }}</td>
                        <td>{{ job.subject || '—' }}</td>
                        <td>{{ job.user || '—' }}</td>
                        <td>
                            <span v-if="job.state === 'active' && job.started_at">
                                running for {{ formatTimesince(job.started_at) }}
                            </span>
                            <span v-else>
                                submitted {{ formatTimesince(job.submitted_at) }} ago
                            </span>
                            <div class="time-detail">
                                {{ job.submitted_at | commonDateTime }}
                            </div>
                        </td>
                        <td class="action-col">
                            <button
                                type="button"
                                class="btn btn-danger btn-xs"
                                :disabled="!isAdmin || abortingIds.includes(job.id)"
                                :title="isAdmin ? '' : 'Only admins can abort jobs.'"
                                @click="abortJob(job)">
                                {{ abortingIds.includes(job.id) ? 'Aborting...' : 'Abort' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import {mapActions} from 'vuex';
    import reportApi from '../../api/report';
    import {commonDateTime, timesince} from "../common/filters";
    import {isAdmin} from '../common/utils';

    const POLL_INTERVAL_MS = 3000;
    const TICK_INTERVAL_MS = 1000;

    export default {
        name: "ReportQueue",
        data() {
            return {
                jobs: [],
                loading: false,
                initialLoading: true,
                loadError: '',
                abortingIds: [],
                tick: 0,
                pollHandle: null,
                tickHandle: null
            };
        },
        computed: {
            isAdmin: function() {
                return isAdmin();
            },
            sortedJobs: function() {
                return [...this.jobs].sort(function(a, b) {
                    return a.submitted_at - b.submitted_at;
                });
            }
        },
        mounted: function() {
            this.fetchQueue();
            this.pollHandle = setInterval(this.fetchQueue, POLL_INTERVAL_MS);
            this.tickHandle = setInterval(() => {
                this.tick = this.tick + 1;
            }, TICK_INTERVAL_MS);
        },
        beforeDestroy: function() {
            if (this.pollHandle) {
                clearInterval(this.pollHandle);
            }
            if (this.tickHandle) {
                clearInterval(this.tickHandle);
            }
        },
        methods: {
            ...mapActions([
                'displayFeedback'
            ]),
            formatTimesince: function(time) {
                // Reference tick so this re-runs each second.
                this.tick; // eslint-disable-line no-unused-expressions
                return timesince(time);
            },
            fetchQueue: async function() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                try {
                    const response = await reportApi.getReportQueue();
                    this.jobs = (response.data && response.data.jobs) || [];
                    this.loadError = '';
                } catch (error) {
                    this.loadError = (error && error.message) || 'Unknown error';
                    if (!this.initialLoading) {
                        this.displayFeedback({type: 'error', errorObj: error});
                    }
                } finally {
                    this.loading = false;
                    this.initialLoading = false;
                }
            },
            abortJob: async function(job) {
                if (!this.isAdmin) {
                    this.displayFeedback({type: 'error', message: 'Only admins can abort jobs.'});
                    return;
                }
                if (this.abortingIds.includes(job.id)) {
                    return;
                }
                this.abortingIds.push(job.id);
                const previousJobs = this.jobs;
                this.jobs = this.jobs.filter(j => j.id !== job.id);
                try {
                    const response = await reportApi.abortReportQueueJob(job.id);
                    const data = (response && response.data) || {};
                    if (data.prior_state === 'active' && data.message) {
                        this.displayFeedback({type: 'info', message: data.message});
                    } else {
                        this.displayFeedback({type: 'success', message: data.message || 'Job aborted.'});
                    }
                } catch (error) {
                    const status = error && error.response && error.response.status;
                    if (status === 404) {
                        this.displayFeedback({type: 'info', message: 'Job already removed.'});
                    } else {
                        this.jobs = previousJobs;
                        this.displayFeedback({type: 'error', errorObj: error});
                    }
                } finally {
                    this.abortingIds = this.abortingIds.filter(id => id !== job.id);
                    this.fetchQueue();
                }
            }
        },
        filters: {
            commonDateTime: commonDateTime,
            timesince: timesince
        }
    };
</script>

<style lang="scss" scoped>
    .report-body-spacing {
        margin-top: 20px;
        margin-bottom: 20px;
    }
    .queue-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15px;
    }
    .queue-header h4 {
        margin: 0;
    }
    .empty-state {
        padding: 30px;
        text-align: center;
        color: #777;
        background: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 4px;
    }
    .queue-table {
        margin-bottom: 0;
    }
    .action-col {
        width: 110px;
        text-align: center;
    }
    .time-detail {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
    }
    .state-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        color: #fff;
    }
    .state-waiting {
        background-color: #888;
    }
    .state-active {
        background-color: #337ab7;
    }
    .spinning {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
</style>
