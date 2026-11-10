<template>
    <div>
        <ing-table :data=this.elements :total=this.totalElements :columns=this.columns :callback="
        ({
          sortDirection,
          sortField,
          filters,
          limit,
          offset
        }) => {
          this.getVenueDetail({
            venueId: venueId,
            limit: limit,
            offset: offset,
            sortField: sortField,
            sortDirection: sortDirection,
            filters: filters,
        })
      }">
        </ing-table>
    </div>
</template>


<script>

import {
    mapActions,
    mapGetters
} from 'vuex';

export default {
    name: 'Venue-Detail',
    data() {
        return {
            columns: [
                {
                    name: 'Element',
                    field: 'elem_name',
                    sortable: true,
                    filterType: 'search'
                },
                {
                    name: 'Description',
                    field: 'type'
                },
                {
                    name: 'Type',
                    field: 'description'
                },
                {
                    name: 'Status',
                    field: 'status'
                },
                {
                    name: 'Serial',
                    field: 'serial'
                },
                {
                    name: 'Notes',
                    field: 'notes'
                }
            ],
            venueId: function () {
                return document.getElementById('venue-id').dataset.venueId;
            }()
        }
    },
    computed: {
        ...mapGetters([
            "elements",
            "totalElements"
        ]),
    },
    created: function () {
        this.getVenueDetail({
            limit: 10,
            venueId: this.venueId
        });
    },

    methods: {
        ...mapActions([
            'getVenueDetail'
        ])
    }
}

</script>

<style lang="scss" scoped>

</style>
