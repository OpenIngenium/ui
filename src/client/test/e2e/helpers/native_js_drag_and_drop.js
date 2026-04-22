function dragAndDrop(sourceNode, destinationNode, dragStyle="DRAG-AND-DROP") {
    const EVENT_TYPES = {
        DRAG:'drag',
        DRAG_START: 'dragstart',
        DRAG_LEAVE: 'dragleave',
        DRAG_OVER: 'dragover',
        DRAG_ENTER: 'dragenter',
        DRAG_EXIT: 'dragexit',
        DRAG_END: 'dragend',
        DROP: 'drop'
    };

    // const drag = createCustomEvent(EVENT_TYPES.DRAG);
    const event = createCustomEvent(EVENT_TYPES.DRAG_START);
    const dragLeave = createCustomEvent(EVENT_TYPES.DRAG_LEAVE);
    const dragOver = createCustomEvent(EVENT_TYPES.DRAG_OVER);
    const dragEnter = createCustomEvent(EVENT_TYPES.DRAG_ENTER);
    // const dragExit = createCustomEvent(EVENT_TYPES.DRAG_EXIT);
    const dragEnd = createCustomEvent(EVENT_TYPES.DRAG_END);
    const dropEvent = createCustomEvent(EVENT_TYPES.DROP);

    function isUndefinedOrNull(any) {
        return (typeof any === "undefined" || any === null);
    }

    function createCustomEvent(type) {
        let event = new Event(type);
        event.dataTransfer = {
            data: {},
            setData: function(type, val) {
                // mock behavior of actual DataTransfer Obj
                if (isUndefinedOrNull(val)) {
                    val = 'undefined';
                }
                this.data[type] = val;
            },
            getData: function(type) {
                return this.data[type];
            },
            setDragImage: function() {
                return;
            }
        };
        return event;
    }

    switch(dragStyle) {
    case "DRAG-AND-DROP":
        sourceNode.dispatchEvent(event);

        dragOver.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragOver);

        dragEnter.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragEnter);

        dropEvent.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dropEvent);
        break;
    case "DRAG-OVER":
        sourceNode.dispatchEvent(event);

        dragOver.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragOver);

        dragEnter.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragEnter);
        break;
    case "DRAG-AND-LEAVE":
        sourceNode.dispatchEvent(event);

        dragOver.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragOver);

        dragEnter.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragEnter);

        dragLeave.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragLeave);

        dragEnd.dataTransfer = event.dataTransfer;
        destinationNode.dispatchEvent(dragEnd);
        break;
    default:
        fail("not a valid drag case");
    }
}

module.exports.dragAndDrop = dragAndDrop;