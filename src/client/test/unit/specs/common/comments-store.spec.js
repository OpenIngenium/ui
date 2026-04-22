import * as faker from "faker";
import store from "../../../../src/modules/common/comments-store";

const {
    conversations,
    conversation,
    comments,
    comment,
    expandedComment,
    reviewers
} = store.getters;

describe("Store for conversations comments-store.js ", () => {
    describe("conversations", () => {
        describe("getters", () => {
            it("conversations - get converstions nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "comments": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let conversations_result = conversations(state)(fakeElementId);

                expect(conversations_result[fakeConversationId].content).toEqual(fakeContent);
            });

            it("conversations - get conversations offnominal", () => {
                const fakeElementId = faker.random.uuid();

                const state = {
                    conversations: {
                        "batman": {
                            "content": "bad data"
                        }
                    }
                };

                let conversations_offnom_result = conversations(state)(fakeElementId);
                
                expect(conversations_offnom_result).toEqual(undefined);
            });

            it("conversation - get conversation nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "comments": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let conversation_result = conversation(state)(fakeElementId, fakeConversationId);

                expect(conversation_result.content).toEqual(fakeContent);
            });

            it("conversation - get conversation off nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            "batman": {
                                "content": fakeContent,
                                "comments": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let conversation_off_nom_result = conversation(state)(fakeElementId, fakeConversationId);

                expect(conversation_off_nom_result).toEqual(undefined);
            });

            it("comments - get comments", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "comments": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let comments_result = comments(state)(fakeElementId, fakeConversationId);

                expect(comments_result[fakeCommentId].content).toEqual(fakeContent);
            });

            it("comments - get comments off nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "batman": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let comments_result = comments(state)(fakeElementId, fakeConversationId);

                expect(comments_result).toEqual(undefined);
            });

            it("comment - get comment", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "comments": {
                                    [fakeCommentId]: {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let comment_result = comment(state)(fakeElementId, fakeConversationId, fakeCommentId);

                expect(comment_result.content).toEqual(fakeContent);
            });

            it("comment - get comment off nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeContent = faker.internet.userName();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                "content": fakeContent,
                                "comments": {
                                    "batman": {
                                        "content": fakeContent
                                    }
                                }
                            }
                        }
                    }
                };

                let comment_off_nom_result = comment(state)(fakeElementId, fakeConversationId, fakeCommentId);

                expect(comment_off_nom_result).toEqual(undefined);
            });

            it("expandedComment - get expanded comment id", () => {
                const fakeCommentId = faker.random.uuid();

                const state = {
                    expandedComment: fakeCommentId
                };

                let expanded_comment_nom_result = expandedComment(state);
                expect(expanded_comment_nom_result).toEqual(fakeCommentId);
            });

            it("reviewers - get reviewers nominal", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeCommentId2 = faker.random.uuid();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                type: "DATA_REVIEW_COMMENT",
                                comments: {
                                    [fakeCommentId]: {
                                        user_name: 'batman'
                                    },
                                    [fakeCommentId2]: {
                                        user_name: 'joker'
                                    }
                                }
                            }
                        }
                    }
                };

                let reviewers_nom_result = reviewers(state);
                expect(reviewers_nom_result).toEqual(['batman', 'joker']);
            });

            it("reviewers - get reviewers, none in correct type", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeCommentId2 = faker.random.uuid();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                type: "COMMENT",
                                comments: {
                                    [fakeCommentId]: {
                                        user_name: 'batman'
                                    },
                                    [fakeCommentId2]: {
                                        user_name: 'joker'
                                    }
                                }
                            },
                            [fakeConversationId]: {
                                type: "ACTIVITY_REPORT_COMMENT",
                                comments: {
                                    [fakeCommentId]: {
                                        user_name: 'batman'
                                    },
                                    [fakeCommentId2]: {
                                        user_name: 'joker'
                                    }
                                }
                            }
                        }
                    }
                };

                let reviewers_nom_result = reviewers(state);
                expect(reviewers_nom_result).toEqual([]);
            });

            it("reviewers - get reviewers, correct type, but no comments", () => {
                const fakeElementId = faker.random.uuid();
                const fakeConversationId = faker.random.uuid();
                const fakeCommentId = faker.random.uuid();
                const fakeCommentId2 = faker.random.uuid();

                const state = {
                    conversations: {
                        [fakeElementId]: {
                            [fakeConversationId]: {
                                type: "DATA_REVIEW_COMMENT",
                                comments: {}
                            }
                        }
                    }
                };

                let reviewers_nom_result = reviewers(state);
                expect(reviewers_nom_result).toEqual([]);
            });
        });
    });
});