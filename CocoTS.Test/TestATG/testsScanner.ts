
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />
/// <chutzpah_reference path="Parser.ts" />
/// <chutzpah_reference path="Scanner.ts" />
/// <reference path="Parser.ts" />
/// <reference path="Scanner.ts" />


test("check scanner: 10 * 3", function () {
	var scanner: testlanguage.Scanner = new testlanguage.Scanner("10 * 3");
	var firstToken = scanner.Scan();
	equal(firstToken.kind, testlanguage.Parser._number);
	equal(firstToken.val, "10");

	var secondToken = scanner.Scan();
	equal(secondToken.kind, testlanguage.Parser._mult);
	equal(secondToken.val, "*");

	var thirdToken = scanner.Scan();
	equal(thirdToken.kind, testlanguage.Parser._number);
	equal(thirdToken.val, "3");

	//expect(0);
})


test("check scanner: 10 * 3 + 20 * 4", function () {
	var scanner = new testlanguage.Scanner("10 * 3 + 20 / 4");

	// 10
	var token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._number);
	equal(token.val, "10");
	
	// * 
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._mult);
	equal(token.val, "*");

	// 3
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._number);
	equal(token.val, "3");

	// +
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._plus);
	equal(token.val, "+");

	// 20
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._number);
	equal(token.val, "20");

	// /
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._div);
	equal(token.val, "/");

	// 4
	token = scanner.Scan();
	equal(token.kind, testlanguage.Parser._number);
	equal(token.val, "4");
});