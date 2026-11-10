// Good Reference
// https://vuejsdevelopers.com/2018/01/08/vue-js-roles-permissions-casl/

import { AbilityBuilder, Ability } from '@casl/ability';

function defineAbilityFor(scopes) {
    const { rules, can } = AbilityBuilder.extract();

    for (const scope of scopes) {
        if (scope.scope === 'admin') {
            can(['read', 'update', 'create', 'delete'], 'Admin');
        } else if (scope.scope === 'basic') {
            can(['read'], 'Execution');
            can(['read'], 'Authoring');
            can(['read', 'update', 'create', 'delete'], 'Basic');
        } else if (scope.scope === 'config_mgmt') {
            can(['read', 'update', 'create', 'delete'], 'Configuration_Management');
        } else if (scope.scope === 'imcm') {
            can(['read', 'update', 'create', 'delete'], 'IMCM');
        } else if (scope.scope === 'test_lead') {
            can(['read', 'update', 'create', 'delete'], 'Test_Lead');
        } else if (scope.scope === 'author') {
            can(['read', 'update', 'create', 'delete'], 'Procedure');
        } else if (scope.scope === 'execute:wsts') {
            can(['read', 'update', 'create', 'delete'], `Execution:WSTS#${scope.venue_group_id}`);
        } else if (scope.scope === 'execute:testbed') {
            can(['read', 'update', 'create', 'delete'], `Execution:Testbed#${scope.venue_group_id}`);
        } else if (scope.scope === 'execute:sit') {
            can(['read', 'update', 'create', 'delete'], `Execution:ATLO#${scope.venue_group_id}`);
        } else if (scope.scope === 'execute:other') {
            can(['read', 'update', 'create', 'delete'], `Execution:Other#${scope.venue_group_id}`);
        }
    }

    return new Ability(rules);
}

export default defineAbilityFor;