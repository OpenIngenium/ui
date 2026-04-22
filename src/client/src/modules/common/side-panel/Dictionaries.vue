<template>
    <div class="dictionaries">
        <div class="row header">
            <div class="col col-sm-12 dotted-line">
                <a class="dictExpand" @click="toggleDisplay()">
                    <h4>Dictionary</h4> 
                    <i v-if="display" class="glyphicon glyphicon-menu-up"></i>
                    <i v-else class="glyphicon glyphicon-menu-down"></i>
                    <span style="font-size: 20px; margin-left: 30px;">{{ selectedFlightDictionaryVersion ? `(${selectedFlightDictionaryVersion})` : '' }}</span>
                </a>
            </div>
        </div>
        <div v-if="display" class="row">
            <div class="col-xs-6">
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size:12px;">SSE Dictionary</label>
                    <select class="form-control"
                        :disabled="disableDropDown"
                        v-on:change="setSseDictionaryVersion($event.target.value)">
                        <option :value="null"></option>
                        <option
                            v-for="(dictionary) in sse"
                            :key="dictionary.dictionary_version"
                            :value="dictionary.dictionary_version"
                            :selected="dictionary.dictionary_version == selectedSseDictionaryVersion">
                            {{dictionary.dictionary_version}}
                        </option>
                    </select>
                </div>
            </div>
            <div class="col-xs-6">
                <div class="form-group" style="margin-bottom: 0;">
                    <label style="font-size:12px;">Flight Dictionary</label>
                    <select class="form-control"
                        :disabled="disableDropDown"
                        v-on:change="setFlightDictionaryVersion($event.target.value)">
                        <option :value="null"></option>
                        <option
                            v-for="(dictionary) in flight"
                            :key="dictionary.dictionary_version"
                            :value="dictionary.dictionary_version"
                            :selected="dictionary.dictionary_version == selectedFlightDictionaryVersion">
                            {{dictionary.dictionary_version}}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapActions, mapGetters } from "vuex";

    export default {
        name: "Dictionaries",
        data() {
            return {
                display: true
            };
        },
        props: {
            pagetype: {
                type: String,
                default: "execution",
                required: false
            }
        },
        computed: {
            ...mapGetters([
                "selectedSseDictionaryVersion",
                "selectedFlightDictionaryVersion",
                "flightDictionaries",
                "sseDictionaries",
                "isTestConductor",
                "mode",
                "editMode",
            ]),
            flight() {
                return this.flightDictionaries.length > 0 ? this.flightDictionaries : [];
            },
            sse() {
                return this.sseDictionaries.length > 0 ? this.sseDictionaries : [];
            },
            disableDropDown() {
                if (this.mode === 'authoring') {
                    return !this.editMode;
                } else {
                    // Let only TC change dictionary, not participants
                    return !this.editMode || !this.isTestConductor;
                }
            }
        },
        methods: {
            ...mapActions([
                "fetchFlightDictionaries",
                "fetchSseDictionaries",
                "setSseDictionaryVersion",
                "setFlightDictionaryVersion",
                "setAuthoringSseDictionary",
                "setAuthoringFlightDictionary"
            ]),
            toggleDisplay() {
                this.display = !this.display;
            }
        },
        created: function() {
            this.fetchFlightDictionaries({ limit: 1000 }).then(() => {
                this.fetchSseDictionaries({ limit: 1000 });
            });
        },
    };
</script>

<style lang="scss" scoped>
    .header {
        margin:0px;
        padding:0px;
        margin-bottom:8px;
        margin-top:10px;
    }

    .header .dotted-line {
        margin:0px;
        padding:0px;
        border-bottom:2px dotted #c8c8c8;
    }

    .dictExpand {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
    
    .dictExpand h4 {
        display: inline-block;
    }

    .dictExpand .caret {
        display: inline-block;
    }

    @media print {
        .dictionaries{
            display:none;
        }
    }
</style>
