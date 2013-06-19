/*----------------------------------------------------------------------
Compiler Generator Coco/R,
Copyright (c) 1990, 2004 Hanspeter Moessenboeck, University of Linz
extended by M. Loeberbauer & A. Woess, Univ. of Linz
with improvements by Pat Terry, Rhodes University

This program is free software; you can redistribute it and/or modify it
under the terms of the GNU General Public License as published by the
Free Software Foundation; either version 2, or (at your option) any
later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

As an exception, it is allowed to write an extension of Coco/R that is
used as a plugin in non-free software.

If not otherwise stated, any source code generated by Coco/R (other than
Coco/R itself) does not fall under the GNU General Public License.
-----------------------------------------------------------------------*/
var testlanguage;
(function (testlanguage) {
    /// <reference path="Scanner.ts" />
    var Parser = (function () {
        function Parser(scanner) {
            this.errDist = Parser.minErrDist;
            this.scanner = scanner;
            this.errors = new Errors();
        }
        Parser.prototype.SynErr = function (n) {
            if (this.errDist >= Parser.minErrDist) {
                this.errors.SynErrPositioned(this.la.line, this.la.col, n);
            }

            this.errDist = 0;
        };

        Parser.prototype.SemErr = function (msg) {
            if (this.errDist >= Parser.minErrDist) {
                this.errors.SemErrPositioned(this.t.line, this.t.col, msg);
            }

            this.errDist = 0;
        };

        Parser.prototype.Get = function () {
            for (; ; ) {
                this.t = this.la;
                this.la = this.scanner.Scan();
                if (this.la.kind <= Parser.maxT) {
                    this.errDist++;
                    break;
                }

                this.la = this.t;
            }
        };

        Parser.prototype.Expect = function (n) {
            if (this.la.kind == n) {
                this.Get();
            } else {
                this.SynErr(n);
            }
        };

        Parser.prototype.StartOf = function (s) {
            return Parser.stateset[s][this.la.kind];
        };

        Parser.prototype.ExpectWeak = function (n, follow) {
            if (this.la.kind == n)
                this.Get(); else {
                this.SynErr(n);
                while (!this.StartOf(follow))
                    this.Get();
            }
        };

        Parser.prototype.WeakSeparator = function (n, syFol, repFol) {
            var kind = this.la.kind;
            if (kind == n) {
                this.Get();
                return true;
            } else if (this.StartOf(repFol)) {
                return false;
            } else {
                this.SynErr(n);
                while (!(Parser.stateset[syFol, kind] || Parser.stateset[repFol, kind] || Parser.stateset[0, kind])) {
                    this.Get();
                    kind = this.la.kind;
                }
                return this.StartOf(syFol);
            }
        };

        Parser.prototype.AddOp = function (ret) {
            if (this.la.kind == 3) {
                this.Get();
                ret.op = "plus";
            } else if (this.la.kind == 4) {
                this.Get();
                ret.op = "minus";
            } else
                this.SynErr(13);
        };
        Parser.prototype.MulOp = function (ret) {
            if (this.la.kind == 5) {
                this.Get();
                ret.op = "mult";
            } else if (this.la.kind == 6) {
                this.Get();
                ret.op = "div";
            } else
                this.SynErr(14);
        };
        Parser.prototype.RelOp = function (ret) {
            if (this.la.kind == 9) {
                this.Get();
                ret.op = "equals";
            } else if (this.la.kind == 7) {
                this.Get();
                ret.op = "lesser";
            } else if (this.la.kind == 8) {
                this.Get();
                ret.op = "greater";
            } else
                this.SynErr(15);
        };
        Parser.prototype.Expr = function (ret) {
            this.SimExpr(ret);
            if (this.la.kind == 7 || this.la.kind == 8 || this.la.kind == 9) {
                var op = { op: "" };
                var right = { expr: null };
                this.RelOp(op);
                this.SimExpr(right);
                ret.expr = { left: ret.expr, op: op.op, right: right.expr };
            }
        };
        Parser.prototype.SimExpr = function (ret) {
            this.Term(ret);
            while (this.la.kind == 3 || this.la.kind == 4) {
                var right = { expr: null };
                var op = { op: "" };
                this.AddOp(op);
                this.Term(right);
                ret.expr = { type: op.op, left: ret.expr, right: right.expr };
            }
        };
        Parser.prototype.Factor = function (ret) {
            if (this.la.kind == 1) {
                var ident = { ident: "" };
                this.Ident(ident);
                ret.expr = { type: "ident", ident: ident.ident };
            } else if (this.la.kind == 2) {
                this.Get();
                ret.expr = { type: "number", number: parseFloat(this.t.val) };
            } else if (this.la.kind == 4) {
                var factor = { expr: null };
                this.Get();
                this.Factor(factor);
                ret.expr = { type: "negation", operand: factor.expr };
            } else if (this.la.kind == 10) {
                this.Get();
                ret.expr = { type: "boolean", value: true };
            } else if (this.la.kind == 11) {
                this.Get();
                ret.expr = { type: "boolean", value: false };
            } else
                this.SynErr(16);
        };
        Parser.prototype.Ident = function (ret) {
            this.Expect(1);
            ret.ident = this.t.val;
        };
        Parser.prototype.Term = function (ret) {
            this.Factor(ret);
            while (this.la.kind == 5 || this.la.kind == 6) {
                var op = { op: "" };
                var right = { expr: null };
                this.MulOp(op);
                this.Factor(right);
                ret.expr = { type: op.op, left: ret.expr, right: right.expr };
            }
        };
        Parser.prototype.Test = function (ret) {
            var test = { expr: null };
            this.Expr(test);
            this.result = test.expr;
        };

        Parser.prototype.Parse = function () {
            this.la = new testlanguage.Token();
            this.la.val = "";
            this.Get();
            this.Test(null);
            this.Expect(0);
        };
        Parser._EOF = 0;
        Parser._ident = 1;
        Parser._number = 2;
        Parser._plus = 3;
        Parser._minus = 4;
        Parser._mult = 5;
        Parser._div = 6;
        Parser._lesser = 7;
        Parser._greater = 8;
        Parser._equals = 9;
        Parser.maxT = 12;

        Parser.T = true;
        Parser.x = false;
        Parser.minErrDist = 2;

        Parser.stateset = [
            [true, false, false, false, false, false, false, false, false, false, false, false, false, false]
        ];
        return Parser;
    })();
    testlanguage.Parser = Parser;

    var Errors = (function () {
        function Errors() {
            this.count = 0;
        }
        Errors.prototype.Errors = function (_errorStream, _errMsgFormat) {
            this.errorStream = _errorStream;
            this.errMsgFormat = _errMsgFormat;
        };

        Errors.prototype.SynErrPositioned = function (line, col, n) {
            var s;
            switch (n) {
                case 0:
                    s = "EOF expected";
                    break;
                case 1:
                    s = "ident expected";
                    break;
                case 2:
                    s = "number expected";
                    break;
                case 3:
                    s = "plus expected";
                    break;
                case 4:
                    s = "minus expected";
                    break;
                case 5:
                    s = "mult expected";
                    break;
                case 6:
                    s = "div expected";
                    break;
                case 7:
                    s = "lesser expected";
                    break;
                case 8:
                    s = "greater expected";
                    break;
                case 9:
                    s = "equals expected";
                    break;
                case 10:
                    s = "\"true\" expected";
                    break;
                case 11:
                    s = "\"false\" expected";
                    break;
                case 12:
                    s = "??? expected";
                    break;
                case 13:
                    s = "invalid AddOp";
                    break;
                case 14:
                    s = "invalid MulOp";
                    break;
                case 15:
                    s = "invalid RelOp";
                    break;
                case 16:
                    s = "invalid Factor";
                    break;

                default:
                    s = "error " + n;
                    break;
            }
            this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
            this.count++;
        };

        Errors.prototype.SemErrPositioned = function (line, col, s) {
            this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
            this.count++;
        };

        Errors.prototype.SemErr = function (s) {
            this.errorStream.WriteLine(s);
            this.count++;
        };

        Errors.prototype.WarningPositioned = function (line, col, s) {
            this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
        };

        Errors.prototype.Warning = function (s) {
            this.errorStream.WriteLine(s);
        };
        return Errors;
    })();
    testlanguage.Errors = Errors;
})(testlanguage || (testlanguage = {}));
//@ sourceMappingURL=Parser.js.map
