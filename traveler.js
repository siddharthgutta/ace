var util = require('./util');
module.exports = function(app, ha) {

    /**
     * render a search
     */
    app.get('/search', function (req, res) {
        var options = util.parseUrlForParams(req.query, ["page", "pageSize", "availability.start", "availability.end",
            "minBedrooms", "maxBedrooms", "minBathrooms", "maxBathrooms",
            "minSleeps", "maxSleeps", "minPrice", "maxPrice", "refine", "sort", "imageSize"]);
        options.locale = "en";
        ha.search(req.query.q, options, function (searchRes) {
            util.handleJsonBody(searchRes, function (body) {
                // cleanup all urls to point to us not the public api
                if (body.nextPage) {
                    body.nextPage = body.nextPage.replace(/.*public/g, "");
                }
                if (body.prevPage) {
                    body.prevPage = body.prevPage.replace(/.*public/g, "");
                }
                var arrayLength = body.hits.length;
                for (var i = 0; i < arrayLength; i++) {
                    body.hits[i].detailsUrl = body.hits[i].detailsUrl.replace(/.*id=/g, "/listing/");
                }
                var refinementsLength = body.refinements.length;
                for (var i = 0; i < refinementsLength; i++) {
                    var optionsLen = body.refinements[i].options.length;
                    for (var j = 0; j < optionsLen; j++) {
                        body.refinements[i].options[j].url = body.refinements[i].options[j].url.replace(/.*public/g, "");
                    }
                }
                res.render("searchResults", body);
            });
        });
    });

    /**
     * render a HomeAway listing
     */
    app.get('/listing/:id', function (req, res) {
        ha.listing(req.params.id,
            ['DETAILS', 'PHOTOS', 'REVIEWS', 'LOCATION', 'RATES', 'AVAILABILITY'],
            function (listingRes) {
                util.handleJsonBody(listingRes, function (body) {
                    res.render("listing", body);
                });
            });
    });

    /**
     * Handle book now call
     */
    app.get('/bookStay', function (req, res) {
        var options = util.parseUrlForParams(req.query, ["childrenCount", "petIncluded"]);
        ha.bookStay(req.query.listingId, req.query.unitId, req.query.arrivalDate, req.query.departureDate, req.query.adultsCount,
            options, function (stayRes) {
                util.handleJsonBody(stayRes, function (body) {
                    res.writeHead(302, {'Location': body.href});
                    res.end();
                });
            });
    });

    /**
     * Create review form
     */
    app.get('/createReviewForm', function (req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.createReviewForm(req, res);
        } else {
            getAuthUserToken(global['createReviewForm'], req, res);
        }
    });

    global.createReviewForm = function createReviewForm(req, res) {
        var body = {};
        body.listingId = req.query.listingId;
        body.unitId = req.query.unitId;
        body.headline = req.query.headline;
        res.render("createReview", body);
    };

    /**
     * POST a review
     */
    app.post('/submitReview', function (req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.submitReview(req, res);
        } else {
            getAuthUserToken(global['submitReview'], req, res);
        }
    });

    global.submitReview = function submitReview(req, res) {
        var review = {};
        review.arrivalDate = req.body.arrivalDate;
        review.headline = req.body.headline;
        review.body = req.body.body;
        review.listingId = req.body.listingId;
        review.unitId = req.body.unitId;
        review.rating = req.body.rating;
        review.locale = "en";
        ha.submitReview(req.cookies.ha_oauth_cookie.token, review, function (stayRes) {
            res.render("welcome", req.cookies.ha_oauth_cookie);
        });
    };

    function getAuthUserToken(handler, req, res) {
        //save the last handler name as a cookie value, so when we get the ticket from OAuth, we can retry the operation
        //the user was trying to access
        res.cookie("ha_oauth_cookie", {last: handler.name}, {secure: true});
        res.writeHead(302, {
            'Location': ha.getAuthUrl()
        });
        res.end();

    }
};
