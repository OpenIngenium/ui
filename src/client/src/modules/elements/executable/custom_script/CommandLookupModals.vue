<template>
    <div>
        <!-- FLIGHT CMD MODAL -->
        <ing-modal v-if="showFlightCmdModal" @close="$emit('close-flight-cmd')" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Lookup CMD</h4>
            </template>
            <template slot="body">
                <cmd-constructor></cmd-constructor>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-default pull-left" @click="$emit('close-flight-cmd')">
                    Cancel
                </button>
                <button type="button" class="btn btn-primary pull-right" @click="$emit('submit-flight-cmd')">
                    Submit
                </button>
            </template>
        </ing-modal>

        <!-- SIM CMD MODAL -->
        <ing-modal v-if="showSimCmdModal" @close="$emit('close-sim-cmd')" size="large">
            <template slot="title">
                <h4 class="modal-title">Lookup CMD</h4>
            </template>
            <template slot="body">
                <CmdSseTable @selectCmd="cmd => $emit('select-cmd', cmd)"></CmdSseTable>
            </template>
            <template slot="footer">
                <div>
                    <button @click="$emit('close-sim-cmd')" type="button"
                        class="btn btn-default pull-left">Cancel</button>
                    <button @click="$emit('close-sim-cmd')" type="button"
                        class="btn btn-primary pull-right cmd_builder_save_btn">
                        Save
                    </button>
                </div>
            </template>
        </ing-modal>

        <!-- FLIGHT / SIM EVR MODAL -->
        <ing-modal v-if="showEvrModal" @close="$emit('close-evr')" size="large">
            <template slot="title">
                <h4 style="font-weight: bold; display: inline-block;">Lookup EVR</h4>
            </template>
            <template slot="body">
                <SelectEvrTable @selectEvr="evr => $emit('select-evr', evr)" :evr-type="evrType"></SelectEvrTable>
            </template>
            <template slot="footer">
                <button type="button" class="btn btn-default pull-right" @click="$emit('close-evr')">
                    Cancel
                </button>
            </template>
        </ing-modal>

        <!-- FLIGHT / SIM TELEM MODAL -->
        <ing-modal v-if="showChannelModal" @close="$emit('close-channel')" size="large">
            <template slot="title">Lookup EHA</template>
            <template slot="body">
                <WaitEhaTable @selectEha="eha => $emit('select-eha', eha)" :channelType="ehaType"></WaitEhaTable>
            </template>
            <template slot="footer">
                <button @click="$emit('close-channel')" type="button" class="btn btn-default pull-left">Cancel</button>
                <button @click="$emit('close-channel')" type="button"
                    class="btn btn-primary pull-right cmd_builder_save_btn">
                    Save
                </button>
            </template>
        </ing-modal>
    </div>
</template>

<script>
    import CmdSseTable from '../cmd-sse/CmdSseTable.vue';
    import SelectEvrTable from '../query-evr/SelectEvrTable.vue';
    import WaitEhaTable from '../wait-eha/WaitEhaTable.vue';
    import CmdConstructor from '../cmd/CmdConstructor.vue';

    export default {
        name: 'CommandLookupModals',
        components: { 
            CmdSseTable, 
            SelectEvrTable, 
            WaitEhaTable, 
            CmdConstructor 
        },
        props: {
            showFlightCmdModal: { 
                type: Boolean, 
                default: false 
            },
            showSimCmdModal: { 
                type: Boolean, 
                default: false 
            },
            showEvrModal: { 
                type: Boolean, 
                default: false
            },
            showChannelModal: { 
                type: Boolean, 
                default: false 
            },
            evrType: { 
                type: String, 
                default: '' 
            },
            ehaType: { 
                type: String, 
                default: '' 
            }
        }
    };
</script>

<style scoped>

</style>
