$(function () {
    function initializeLunr() {
        window.searcher = lunr(function () {
            this.field('denominacion', {boost: 10});
            this.field('descripcion', {boost: 8});
            this.field('jurisdiccion', {boost: 5});
            this.field('fecha');
            this.field('actualizacion');
            this.ref('id')
        });
        for (var i=0; i<window.pad.length; i++) {
            var sercheable = $.extend({}, window.pad[i], {id: i});
            window.searcher.add(sercheable);
        }
    }

    function searchByText(query) {
        var results;
        if (query.q && query.q.length > 0 && query.q[0]) {
            var lunrResults = window.searcher.search(query.q[0]);
            results = [];
            for (var i=0; i<lunrResults.length; i++) {
                var lunrResult = lunrResults[i];
                var resultWithScore = $.extend({}, window.pad[lunrResult.ref], lunrResult);
                results.push(resultWithScore)
            }
        } else {
            results = window.pad;
        }

        console.log(results);
        return results
    }

    function filterResults(unfilteredResults, query) {
        return unfilteredResults
    }

    function renderTitle(results, query) {

    }

    function renderResults(results, query) {
    }

    function renderFilters(results, query) {

    }

    loadCSV().then(function() {
        initializeLunr();

        var query = parseUrlQuery();
        var unfilteredResults = searchByText(query);
        var results = filterResults(unfilteredResults, query);
        renderTitle(results, query);
        renderFilters(results, query);
        renderResults(results, query);
    });
});