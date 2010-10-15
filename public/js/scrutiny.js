$(document).ready(function() {
    module("genesis");
    test("in the beginning", function() {
        ok(true, "this test is absolutely, positively fine");
        var litval = "welcome";
        equals(litval, "welcome", "we expected 'welcome'");
    });
    test("abraham", function() {
        same([], [], "thus, is the same");
        ok("three" != 3, "3 is not THREE");
    });
});
