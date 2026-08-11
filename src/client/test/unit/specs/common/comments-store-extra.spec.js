import commentsStore from "../../../../src/modules/common/comments-store";

const g = commentsStore.getters;
const m = commentsStore.mutations;

describe("comments-store getters", () => {
    it("elementsConversations aggregates conversations with element info", () => {
        const state = {
            conversations: {
                e1: {c1: {conversation_id: "c1", type: "COMMENT", comments: {}}}
            }
        };
        const rootState = {
            execution: {
                elementIds: ["e1"],
                elements: {e1: {elem_id: "e1", title: "T", number: "1"}},
                elemFilters: {filterElementIdMap: {}}
            }
        };
        const result = g.elementsConversations(state, {}, rootState);
        expect(result.length).toBe(1);
        expect(result[0].element).toEqual({element_id: "e1", title: "T", number: "1"});
    });

    it("elementsConversations supports the authoring root state", () => {
        const state = {conversations: {e1: {c1: {conversation_id: "c1", type: "COMMENT", comments: {}}}}};
        const rootState = {
            authoring: {
                elementIds: ["e1"],
                elements: {e1: {elem_id: "e1", title: "T", number: "1"}},
                elemFilters: {filterElementIdMap: {}}
            }
        };
        expect(g.elementsConversations(state, {}, rootState).length).toBe(1);
    });

    it("elementsConversations returns [] when neither execution nor authoring exist", () => {
        expect(g.elementsConversations({conversations: {}}, {}, {})).toEqual([]);
    });

    it("simple conversation getters read nested state", () => {
        const state = {
            conversations: {e1: {c1: {comments: {cm1: {content: "hi"}}}}},
            expandedComment: "cm1",
            currEditCommentIds: {e1: "cm1"}
        };
        expect(g.conversations(state)("e1")).toEqual({c1: {comments: {cm1: {content: "hi"}}}});
        expect(g.conversation(state)("e1", "c1").comments.cm1.content).toBe("hi");
        expect(g.comments(state)("e1", "c1")).toEqual({cm1: {content: "hi"}});
        expect(g.comment(state)("e1", "c1", "cm1")).toEqual({content: "hi"});
        expect(g.expandedComment(state)).toBe("cm1");
        expect(g.currEditCommentIds(state)).toEqual({e1: "cm1"});
    });

    it("reviewers collects unique data-review comment authors", () => {
        const state = {
            conversations: {
                e1: {
                    c1: {
                        type: "DATA_REVIEW_COMMENT",
                        comments: {cm1: {user_name: "alice"}, cm2: {user_name: "bob"}}
                    },
                    c2: {type: "COMMENT", comments: {cm3: {user_name: "carol"}}}
                }
            }
        };
        const reviewers = g.reviewers(state);
        expect(reviewers).toContain("alice");
        expect(reviewers).toContain("bob");
        expect(reviewers).not.toContain("carol");
    });
});

describe("comments-store mutations", () => {
    it("setConversations merges conversations", () => {
        const state = {conversations: {a: 1}};
        m.setConversations(state, {conversations: {b: 2}});
        expect(state.conversations).toEqual({a: 1, b: 2});
    });

    it("setElementConversations indexes comments by id", () => {
        const state = {conversations: {}};
        m.setElementConversations(state, {
            elementId: "e1",
            conversations: [{conversation_id: "c1", comments: [{comment_id: "cm1"}]}]
        });
        expect(state.conversations.e1.c1.comments.cm1).toEqual({comment_id: "cm1"});
    });

    it("addElementConversation adds and indexes comments", () => {
        const state = {conversations: {e1: {}}};
        m.addElementConversation(state, {
            elementId: "e1",
            conversation: {conversation_id: "c1", comments: [{comment_id: "cm1"}]}
        });
        expect(state.conversations.e1.c1.comments.cm1).toEqual({comment_id: "cm1"});
    });

    it("editElementConversation updates type and status", () => {
        const state = {conversations: {e1: {c1: {type: "COMMENT", status: "OPEN"}}}};
        m.editElementConversation(state, {elementId: "e1", conversationId: "c1", conversation: {type: "DATA_REVIEW_COMMENT", status: "RESOLVED"}});
        expect(state.conversations.e1.c1.type).toBe("DATA_REVIEW_COMMENT");
        expect(state.conversations.e1.c1.status).toBe("RESOLVED");
    });

    it("deleteElementConversation removes a conversation", () => {
        const state = {conversations: {e1: {c1: {}, c2: {}}}};
        m.deleteElementConversation(state, {elementId: "e1", conversationId: "c1"});
        expect(state.conversations.e1.hasOwnProperty("c1")).toBe(false);
        expect(state.conversations.e1.hasOwnProperty("c2")).toBe(true);
    });

    it("comment add/edit/delete mutations manage comments and expandedComment", () => {
        const state = {conversations: {e1: {c1: {comments: {}}}}, expandedComment: ""};
        m.addElementConversationComment(state, {elementId: "e1", conversationId: "c1", comment: {comment_id: "cm1", content: "a"}});
        expect(state.conversations.e1.c1.comments.cm1.content).toBe("a");
        expect(state.expandedComment).toBe("cm1");

        m.editElementConversationComment(state, {elementId: "e1", conversationId: "c1", commentId: "cm1", comment: {comment_id: "cm1", content: "b"}});
        expect(state.conversations.e1.c1.comments.cm1.content).toBe("b");

        m.deleteElementConversationComment(state, {elementId: "e1", conversationId: "c1", commentId: "cm1"});
        expect(state.conversations.e1.c1.comments.hasOwnProperty("cm1")).toBe(false);
    });

    it("expand edit mutations set and clear expandedComment", () => {
        const state = {expandedComment: ""};
        m.addConversationExpandEdit(state, {commentId: "cm9"});
        expect(state.expandedComment).toBe("cm9");
        m.removeConversationExpandEdit(state);
        expect(state.expandedComment).toBe("");
    });

    it("element comment list mutations", () => {
        const state = {comments: {}, currEditCommentIds: {}};
        m.setElementComments(state, {elementId: "e1", comments: [{comment_id: "cm1"}]});
        expect(state.comments.e1).toEqual([{comment_id: "cm1"}]);
        m.addElementComment(state, {elementId: "e1", comment: {comment_id: "cm2"}});
        expect(state.comments.e1.length).toBe(2);
        m.updateElementComment(state, {elementId: "e1", comment: {comment_id: "cm2b"}});
        expect(state.comments.e1[state.comments.e1.length - 1]).toEqual({comment_id: "cm2b"});
        m.deleteLastElementComment(state, {elementId: "e1"});
        expect(state.comments.e1.length).toBe(1);
        m.setCurrEditCommentId(state, {elementId: "e1", commentId: "cm1"});
        expect(state.currEditCommentIds.e1).toBe("cm1");
    });
});
