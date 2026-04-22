<template>
    <div>
        <div class="row table-footer">
            <div class="col-md-4 msg-col">
                <span>Showing {{startNum}} to {{endNum}} of {{total}} entries.</span>
            </div>
            <div class="col-md-4 paginator-col">
                <paginator
                    :limit="limit"
                    :total-items="total"
                    :ellipsis-threshold="5"
                    :window-radius="1"
                    :callback="(({offset, limit}) => {this.changePagination({offset, limit})})">
                </paginator>
            </div>
            <div class="col-md-4 limit-col">
                <label>
                    Show
                    <select class="form-control input-sm" @change="changeLimit">
                        <option v-for="limit in pageLimitChoices" :value="limit" :key="limit">{{limit}}</option>
                    </select>
                    Entries
                </label>
            </div>
        </div>
    </div>
</template>


<script>
    import Paginator from "../common/Paginator.vue";

    export default {
        name: "DashboardPaginator",
        components: {
            "paginator": Paginator
        },
        props: {
            total: {
                type: Number,
                default: 0
            },
            offset: {
                type: Number,
                default: 0
            },
            limit: {
                type: Number,
                default: 18
            },
            callback: Function,
            pageLimitChoices: {
                type: Array,
                default: () => [18, 36, 72, 144]
            },
        },
        computed: {
            startNum: function() {
                return this.total > 0 ? this.offset + 1 : 0;
            },
            endNum: function() {
                if (this.offset + this.limit > this.total) {
                    return this.total;
                } else {
                    return this.limit + this.offset;
                }
            },
        },
        methods: {
            triggerCallback: function({offset, limit}) {
                if(this.callback) {
                    this.callback({
                        offset: offset,
                        limit: limit,
                    });
                }
            },
            changeLimit: function(el) {
                this.triggerCallback({offset: 0, limit: parseInt(el.target.value)});
            },
            changePagination: function(params) {
                this.triggerCallback({offset: params.offset, limit: params.limit});
            },
        },
    };
</script>

<style lang="scss" scoped>
    .table-footer {
        .paginator-col {
            text-align: center;
        }
        .limit-col,
        .msg-col {
            margin: 20px 0;
        }
        .limit-col {
            text-align: right;
            label {
                font-weight: normal;
                text-align: left;
                display: inline-block;
                max-width: 100%;
            }
            .form-control {
                width: 75px;
                display: inline-block;
            }
        }
    }
</style>
