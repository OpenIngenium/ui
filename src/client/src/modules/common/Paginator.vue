<template>
    <div v-if="numPages > 1">
        <!-- Default case for pagination -->
        <nav v-if="numPages <= ellipsisThreshold" aria-label="Page navigation">
            <ul class="pagination pagination-sm">
                <li v-if="!isFirstPage">
                    <a aria-label="Previous" @click="handlePrevPage">
                        <span aria-hidden="true">Previous</span>
                    </a>
                </li>
                <li v-for="(page, idx) in numPages" :key="idx" :class="{active: idx === activePageIndex}">
                    <a @click="handlePageChange($event, idx)">{{ idx + 1 }}</a>
                </li>
                <li v-if="!isLastPage">
                    <a aria-label="Next" @click="handleNextPage">
                        <span aria-hidden="true">Next</span>
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Pagination with ellipsis -->
        <nav v-else aria-label="Page navigation">
            <ul class="pagination pagination-sm">
                <li v-if="!isFirstPage">
                    <a aria-label="Previous" @click="handlePrevPage">
                        <span aria-hidden="true">Previous</span>
                    </a>
                </li>

                <!-- LHS elements -->
                <template v-if="activePageIndex < ellipsisThreshold">
                    <li v-for="(page, idx) in ellipsisThreshold" :key="idx" :class="{active: idx === activePageIndex}">
                        <a @click="handlePageChange($event, idx)">{{ idx + 1 }}</a>
                    </li>
                    <li class="disabled"><a>...</a></li>
                    <li><a @click="handlePageChange($event, numPages - 1)">{{ numPages }}</a></li>
                </template>

                <!-- Middle elements -->
                <template v-else-if="activePageIndex >= ellipsisThreshold && activePageIndex < (numPages - ellipsisThreshold)">
                    <li><a @click="handlePageChange($event, 0)">{{ 1 }}</a></li>
                    <li class="disabled"><a>...</a></li>
                    <li v-for="(page, offset) in windowSize" :key="activePageIndex - windowRadius + offset" :class="{active: activePageIndex - windowRadius + offset === activePageIndex}">
                        <a @click="handlePageChange($event, activePageIndex - windowRadius + offset)">{{ activePageIndex - windowRadius + offset + 1 }}</a>
                    </li>
                    <li class="disabled"><a>...</a></li>
                    <li><a @click="handlePageChange($event, numPages - 1)">{{ numPages }}</a></li>
                </template>

                <!-- RHS elements -->
                <template v-else>
                    <li><a @click="handlePageChange($event, 0)">{{ 1 }}</a></li>
                    <li class="disabled"><a>...</a></li>
                    <li v-for="(page, idx) in ellipsisThreshold" :key="numPages - ellipsisThreshold + idx" :class="{active: numPages - ellipsisThreshold + idx === activePageIndex}">
                        <a @click="handlePageChange($event, numPages - ellipsisThreshold + idx)">{{ numPages - ellipsisThreshold + idx + 1 }}</a>
                    </li>
                </template>

                <li v-if="!isLastPage">
                    <a aria-label="Next" @click="handleNextPage">
                        <span aria-hidden="true">Next</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script>
    export default {
        name: "Paginator",
        props: {
            limit: {
                type: Number,
                default: 10
            },
            totalItems: {
                type: Number,
                required: true
            },
            ellipsisThreshold: {
                type: Number,
                default: 5
            },
            windowRadius: {
                type: Number,
                default: 1
            },
            callback: {
                type: Function,
                required: true
            },
            defaultPage: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                activePageIndex: 0
            };
        },
        computed: {
            numPages() {
                return Math.ceil(this.totalItems / this.limit);
            },
            offset() {
                return this.activePageIndex * this.limit;
            },
            windowSize() {
                return this.windowRadius * 2 + 1;
            },
            isFirstPage() {
                return this.activePageIndex === 0;
            },
            isLastPage() {
                return this.activePageIndex === this.numPages - 1;
            }
        },
        watch: {
            totalItems: function() {
                // If number of items change, we should reset the paginator to page 0
                // to potentially avoid out of bounds pages
                this.activePageIndex = 0;
            },
            limit: function() {
                // If limit changes, set activePageIndex bac to 0
                this.activePageIndex = 0;
            },
        },
        methods: {
            userCallback: function() {
                this.callback({limit: this.limit, offset: this.offset});
            },
            handlePageChange: function(event, index) {
                this.activePageIndex = index;
                this.userCallback();
            },
            handlePrevPage: function() {
                this.activePageIndex -= 1;
                this.userCallback();
            },
            handleNextPage: function() {
                this.activePageIndex += 1;
                this.userCallback();
            }
        }
    };
</script>

<style scoped>
    a {
        cursor: pointer;
    }
</style>

