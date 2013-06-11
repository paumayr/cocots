
/// <reference path="../Scripts/typings/qunit/qunit.d.ts" />
/// <chutzpah_reference path="Parser.ts" />
/// <chutzpah_reference path="Scanner.ts" />
/// <reference path="Parser.ts" />
/// <reference path="Scanner.ts" />

test("basic parse: 10 * 3", function () {
	var scanner = new testlanguage.Scanner("10 * 3");
	var parser = new testlanguage.Parser(scanner);
	parser.Parse();

	equal(parser.result.type, "mult");
	deepEqual(parser.result.left, { "type": "number", "number": 10 });
	deepEqual(parser.result.right, { "type": "number", "number" : 3 });
});

test("nested parse: 10 * 3 + 8 * 2", function () {
	var scanner = new testlanguage.Scanner("10 * 3 + 8 * 2");
	var parser = new testlanguage.Parser(scanner);
	parser.Parse();

	deepEqual(parser.result,
	{
		"left": {
			"left": { "type": "number", "number": 10 },
			"right": { "type": "number", "number": 3 },
			"type" : "mult"
		},
		"type": "plus",
		"right": {
			"left": { "type": "number", "number": 8 },
			"right": { "type": "number", "number": 2 },
			"type": "mult"
		}
	});
});
