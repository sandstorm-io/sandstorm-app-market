FlowRouter.route('/', {
    action: function() {
        FlowLayout.render("MasterLayout", {mainSection: "Home"});
    }
});
