var util = require('./util');
module.exports = function(app, ha){

    app.get('/myListings', function(req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.myListings(req, res);
        } else {
            getAuthUserToken(global['myListings'], req, res);
        }

    });

    global.myListings = function myListings(req, res) {
        var options = util.parseUrlForParams(req.query, ["addressContains", "sortBy", "filterProductType", "page", "pageSize", "filterStatus"]);
        ha.myListings(req.cookies.ha_oauth_cookie.token, options, function(listingRes) {
            util.handleJsonBody(listingRes, function(body) {
                // cleanup all urls to point to us not the public api
                if (body.nextPage) {
                    body.nextPage = body.nextPage.replace(/.*public/g,"");
                }
                if (body.prevPage) {
                    body.prevPage = body.prevPage.replace(/.*public/g,"");
                }
                if (body.filters) {
                    var filtersLength = body.filters.length;
                    for (var i = 0; i < filtersLength; i++) {
                        var optionsLen = body.filters[i].links.length;
                        for (var j = 0; j < optionsLen; j++) {
                            body.filters[i].links[j].url = body.filters[i].links[j].url.replace(/.*public/g, "");
                        }
                    }
                }
                if (body.sortBy) {
                    var sortByLength = body.sortBy.length;
                    for (var i = 0; i < sortByLength; i++) {
                        if (body.sortBy[i].urlNone) {
                            body.sortBy[i].urlNone = body.sortBy[i].urlNone.replace(/.*public/g, "");
                        }
                        if (body.sortBy[i].urlAsc) {
                            body.sortBy[i].urlAsc = body.sortBy[i].urlAsc.replace(/.*public/g, "");
                        }
                        if (body.sortBy[i].urlDesc) {
                            body.sortBy[i].urlDesc = body.sortBy[i].urlDesc.replace(/.*public/g, "");
                        }
                    }
                }
                res.render("ownerListings", body);
            });
        });
    };

    app.get('/myReservations', function(req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.myListingReservations(req, res);
        } else {
            getAuthUserToken(global['myReservations'], req, res);
        }
    });

    global.myListingReservations = function myListingReservations(req, res) {
        var options = util.parseUrlForParams(req.query, ["page", "pageSize", "firstName", "lastName", "email", "availabilityStatus", "referenceNumber", "paymentStatus", "beginDate", "endDate", "sortBy"]);
        ha.myListingReservations(req.cookies.ha_oauth_cookie.token, req.query.listingId, options, function(listingRes) {
            util.handleJsonBody(listingRes, function(body) {
                // cleanup all urls to point to us not the public api
                if (body.nextPage) {
                    body.nextPage = body.nextPage.replace(/.*public/g,"");
                }
                if (body.prevPage) {
                    body.prevPage = body.prevPage.replace(/.*public/g,"");
                }
                if (body.filters) {
                    var filtersLength = body.filters.length;
                    for (var i = 0; i < filtersLength; i++) {
                        var optionsLen = body.filters[i].links.length;
                        for (var j = 0; j < optionsLen; j++) {
                            body.filters[i].links[j].url = body.filters[i].links[j].url.replace(/.*public/g, "");
                        }
                    }
                }
                if (body.sortBy) {
                    var sortByLength = body.sortBy.length;
                    for (var i = 0; i < sortByLength; i++) {
                        if (body.sortBy[i].urlNone) {
                            body.sortBy[i].urlNone = body.sortBy[i].urlNone.replace(/.*public/g, "");
                        }
                        if (body.sortBy[i].urlAsc) {
                            body.sortBy[i].urlAsc = body.sortBy[i].urlAsc.replace(/.*public/g, "");
                        }
                        if (body.sortBy[i].urlDesc) {
                            body.sortBy[i].urlDesc = body.sortBy[i].urlDesc.replace(/.*public/g, "");
                        }
                    }
                }
                res.render("ownerListingReservations", body);
            });
        })

    };

    /**
     * welcome page
     */
    app.get('/myInbox', function(req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.myInbox(req, res);
        } else {
            getAuthUserToken(global['myInbox'], req, res);
        }

    });
    
    global.myInbox = function myInbox(req, res) {
        var options = util.parseUrlForParams(req.query, ["page", "pageSize", "beforeDate", "afterDate", "inquiries", "reservations", "archived", "unreadOnly", "unrepliedOnly", "status", "locale"]);

        ha.myInbox(req.cookies.ha_oauth_cookie.token, options, function(resp) {
            util.handleJsonBody(resp, function (body) {
                if (body.nextPage) {
                    body.nextPage = body.nextPage.replace(/.*public/g,"");
                }
                if (body.prevPage) {
                    body.prevPage = body.prevPage.replace(/.*public/g,"");
                }
                body.originalUrl = req.originalUrl;

                for (var i = 0; i < body.conversations.length; i++) {
                    var conversation = body.conversations[i];
                    var date = new Date(conversation.lastMessage.date);
                    conversation.lastMessage.date = date.toString();
                }
                res.render("inbox", body);
            });
        });
        
    };

    app.post('/addMessage', function(req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.addMessage(req, res);
        } else {
            getAuthUserToken(global['addMessage'], req, res);
        }
    });
    
    global.addMessage = function addMessage(req, res) {
        var message = req.body;
        var options = util.parseUrlForParams(req.query, ["locale"]);
        ha.addMessage(req.cookies.ha_oauth_cookie.token, req.query.conversationId, message, options, function(resp) {
            util.handleJsonBody(resp, function (body) {
                res.writeHead(302, {
                    'Location': "/conversation?id=" + req.query.conversationId
                });
                res.end();
            });
        });
    };

    app.get('/conversation', function(req, res) {
        if (req.cookies.ha_oauth_cookie) {
            global.conversation(req, res);
        } else {
            getAuthUserToken(global['conversation'], req, res);
        }

    });
    
    global.conversation = function conversation(req, res) {
        var options = util.parseUrlForParams(req.query, ["locale"]);
        ha.conversation(req.cookies.ha_oauth_cookie.token, req.query.id, options, function(resp) {
            util.handleJsonBody(resp, function (body) {
                for (var i = 0; i < body.message.length; i++) {
                    var message = body.message[i];
                    var date = new Date(message.date);
                    message.date = date.toString();
                }
                res.render("conversation", body);
            });
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