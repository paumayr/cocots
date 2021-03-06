test("check scanner: 10 * 3", function () {
    var scanner = new testlanguage.Scanner("10 * 3");
    var firstToken = scanner.Scan();
    equal(firstToken.kind, testlanguage.Parser._number);
    equal(firstToken.val, "10");
    var secondToken = scanner.Scan();
    equal(secondToken.kind, testlanguage.Parser._mult);
    equal(secondToken.val, "*");
    var thirdToken = scanner.Scan();
    equal(thirdToken.kind, testlanguage.Parser._number);
    equal(thirdToken.val, "3");
});
test("check scanner: 10 * 3 + 20 * 4", function () {
    var scanner = new testlanguage.Scanner("10 * 3 + 20 / 4");
    var token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._number);
    equal(token.val, "10");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._mult);
    equal(token.val, "*");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._number);
    equal(token.val, "3");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._plus);
    equal(token.val, "+");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._number);
    equal(token.val, "20");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._div);
    equal(token.val, "/");
    token = scanner.Scan();
    equal(token.kind, testlanguage.Parser._number);
    equal(token.val, "4");
});
