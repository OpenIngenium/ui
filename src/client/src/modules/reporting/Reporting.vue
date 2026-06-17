<template>
    <div>
        <div class="row">
            <div class="col-md-12">
                <div :style="{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '15px'}">
                    <h2 :style="{marginRight: 'auto'}"><i class="glyphicon glyphicon-book"></i> Reporting</h2>
                </div>
            </div>
        </div>
        <div class="row">
            <ul class="nav nav-tabs">
              <li class="nav-item">
                <a class="nav-link" :class="{active: activeTab === 'create'}" href="#" @click.prevent="activeTab = 'create'">Create Report</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" :class="{active: activeTab === 'queue'}" href="#" @click.prevent="activeTab = 'queue'">Report Queue</a>
              </li>
            </ul>
        </div>
        <create-report v-if="activeTab === 'create'"></create-report>
        <report-queue v-if="activeTab === 'queue'"></report-queue>
        <!-- FOOTER -->
        <ing-footer></ing-footer>
    </div> 
</template>

<script>
    import CreateReport from './CreateReport.vue';
    import ReportQueue from './ReportQueue.vue';
    import IngFooter from "../common/IngFooter.vue";

    export default {
        name: "Reporting",
        components: {
            'create-report': CreateReport,
            'report-queue': ReportQueue,
            'ing-footer': IngFooter
        },
        data() {
            return {
                activeTab: 'create'
            };
        }
    };
</script>

<style lang="scss" scoped>
    .nav-link.active {
        background-color: #eee;
        color: black;
    }
</style>
