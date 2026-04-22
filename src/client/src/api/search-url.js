// Search Config
const searchVersion = 'v1';
const searchUrl = `/search_server/api/${searchVersion}`;

const searchUrls = {
    allQueryBuilder() {
        return searchUrl + '/querybuilders';
    },
    queryBuilder(queryBuilderId="") {
        return searchUrls.allQueryBuilder() + (queryBuilderId && "/" + queryBuilderId);
    },
    search() {
        return searchUrl + '/search';
    }
    
};

export {
    searchUrls
};
