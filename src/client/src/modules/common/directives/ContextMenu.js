export const ContextMenu = {
    bind: function(el, binding, vnode) {
        el.clickOutsideEvent = function(event) {
            if (
                el !== event.target &&
                !el.contains(event.target) &&
                // Check if the item getting clicked or divs outside it are not the context menu button
                !event.target.closest(`#context-menu-button`)
            ) {
                // call the provided method
                vnode.context[binding.expression](event);
            }
        };
        document.body.addEventListener('click', el.clickOutsideEvent);
    },
    unbind: function(el) {
        document.body.removeEventListener('click', el.clickOutsideEvent);
    }
};