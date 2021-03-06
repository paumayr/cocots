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


module testlanguage {



/// <reference path="Scanner.ts" />

export class Parser {
	public static _EOF : number = 0;
	public static _ident : number = 1;
	public static _number : number = 2;
	public static _plus : number = 3;
	public static _minus : number = 4;
	public static _mult : number = 5;
	public static _div : number = 6;
	public static _lesser : number = 7;
	public static _greater : number = 8;
	public static _equals : number = 9;
	public static maxT : number = 12;

	static T : bool = true;
	static x : bool = false;
	static minErrDist : number = 2;
	
	public scanner : Scanner;
	public errors : Errors;

	public t : Token;    // last recognized token
	public la : Token;   // lookahead token
	public errDist = Parser.minErrDist;

public result : any;



	constructor(scanner : Scanner) 
	{
		this.scanner = scanner;
		this.errors = new Errors();
	}

	SynErr (n : number)
	{
		if (this.errDist >= Parser.minErrDist)
		{
			this.errors.SynErrPositioned(this.la.line, this.la.col, n);
		}

		this.errDist = 0;
	}

	SemErr (msg : string)
	{
		if (this.errDist >= Parser.minErrDist)
		{
			this.errors.SemErrPositioned(this.t.line, this.t.col, msg);
		}

		this.errDist = 0;
	}
	
	Get ()
	{
		for (;;)
		{
			this.t = this.la;
			this.la = this.scanner.Scan();
			if (this.la.kind <= Parser.maxT) 
			{ 
				this.errDist++; 
				break; 
			}

			this.la = this.t;
		}
	}
	
	Expect (n : number) {
		if (this.la.kind == n)
		{
			this.Get(); 
		}
		else
		{ 
			this.SynErr(n);
		}
	}
	
	StartOf (s : number) : bool {
		return Parser.stateset[s][this.la.kind];
	}
	
	ExpectWeak (n : number, follow : number) {
		if (this.la.kind == n) this.Get();
		else {
			this.SynErr(n);
			while (!this.StartOf(follow)) this.Get();
		}
	}


	WeakSeparator(n : number, syFol : number, repFol : number) : bool {
		var kind = this.la.kind;
		if (kind == n) {this.Get(); return true;}
		else if (this.StartOf(repFol)) {return false;}
		else {
			this.SynErr(n);
			while (!(Parser.stateset[syFol, kind] || Parser.stateset[repFol, kind] || Parser.stateset[0, kind])) {
				this.Get();
				kind = this.la.kind;
			}
			return this.StartOf(syFol);
		}
	}

	
	AddOp(ret : {op : string;}) {
		if (this.la.kind == 3) {
			this.Get();
			ret.op = "plus"; 
		} else if (this.la.kind == 4) {
			this.Get();
			ret.op = "minus"; 
		} else this.SynErr(13);
	}
	MulOp(ret : {op : string;}) {
		if (this.la.kind == 5) {
			this.Get();
			ret.op = "mult"; 
		} else if (this.la.kind == 6) {
			this.Get();
			ret.op = "div"; 
		} else this.SynErr(14);
	}
	RelOp(ret : {op : string;}) {
		if (this.la.kind == 9) {
			this.Get();
			ret.op = "equals"; 
		} else if (this.la.kind == 7) {
			this.Get();
			ret.op = "lesser"; 
		} else if (this.la.kind == 8) {
			this.Get();
			ret.op = "greater"; 
		} else this.SynErr(15);
	}
	Expr(ret : {expr : any;}) {
		this.SimExpr(ret);
		if (this.la.kind == 7 || this.la.kind == 8 || this.la.kind == 9) {
			var op = { op : "" }; var right = { expr : null }; 
			this.RelOp(op);
			this.SimExpr(right);
			ret.expr = { left : ret.expr, op : op.op, right : right.expr }; 
		}
	}
	SimExpr(ret : {expr : any;}) {
		this.Term(ret);
		while (this.la.kind == 3 || this.la.kind == 4) {
			var right = { expr : null }; var op = { op : "" }; 
			this.AddOp(op);
			this.Term(right);
			ret.expr = { type : op.op, left : ret.expr, right : right.expr }; 
		}
	}
	Factor(ret : {expr : any;}) {
		if (this.la.kind == 1) {
			var ident = { ident : "" }; 
			this.Ident(ident);
			ret.expr = { type: "ident", ident : ident.ident }; 
		} else if (this.la.kind == 2) {
			this.Get();
			ret.expr = { type: "number", number : parseFloat(this.t.val) }; 
		} else if (this.la.kind == 4) {
			var factor = { expr : null }; 
			this.Get();
			this.Factor(factor);
			ret.expr = { type: "negation", operand : factor.expr }; 
		} else if (this.la.kind == 10) {
			this.Get();
			ret.expr = { type: "boolean", value : true }; 
		} else if (this.la.kind == 11) {
			this.Get();
			ret.expr = { type: "boolean", value : false }; 
		} else this.SynErr(16);
	}
	Ident(ret : {ident : string;}) {
		this.Expect(1);
		ret.ident = this.t.val; 
	}
	Term(ret : {expr : any;}) {
		this.Factor(ret);
		while (this.la.kind == 5 || this.la.kind == 6) {
			var op = { op : "" }; var right = { expr : null }; 
			this.MulOp(op);
			this.Factor(right);
			ret.expr = { type: op.op, left : ret.expr, right : right.expr }; 
		}
	}
	Test(ret : {}) {
		var test = { expr : null }; 
		this.Expr(test);
		this.result = test.expr; 
	}


	public Parse() {
		this.la = new Token();
		this.la.val = "";		
		this.Get();
		this.Test(null);
		this.Expect(0);

	}
	
	static stateset : bool[][] = [
		[true,false,false,false, false,false,false,false, false,false,false,false, false,false]

	];
} // end Parser

export interface ErrorStream
{
	WriteFormattedLine : (errorFormat : string, line : number, column : number, message : string) => void;
	WriteLine :  (message : string) => void;

}

export class Errors {
	public count : number = 0;                                    // number of errors detected

	public errorStream : ErrorStream;

	public errMsgFormat : string;

	Errors(_errorStream : ErrorStream, _errMsgFormat : string)
	{
		this.errorStream = _errorStream;
		this.errMsgFormat = _errMsgFormat;
	}

	public SynErrPositioned (line : number, col : number, n : number) {
		var s : string;
		switch (n) {
			case 0: s = "EOF expected"; break;
			case 1: s = "ident expected"; break;
			case 2: s = "number expected"; break;
			case 3: s = "plus expected"; break;
			case 4: s = "minus expected"; break;
			case 5: s = "mult expected"; break;
			case 6: s = "div expected"; break;
			case 7: s = "lesser expected"; break;
			case 8: s = "greater expected"; break;
			case 9: s = "equals expected"; break;
			case 10: s = "\"true\" expected"; break;
			case 11: s = "\"false\" expected"; break;
			case 12: s = "??? expected"; break;
			case 13: s = "invalid AddOp"; break;
			case 14: s = "invalid MulOp"; break;
			case 15: s = "invalid RelOp"; break;
			case 16: s = "invalid Factor"; break;

			default: s = "error " + n; break;
		}
		this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
		this.count++;
	}

	public SemErrPositioned (line : number, col : number, s : string) {
		this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
		this.count++;
	}
	
	public SemErr (s : string) {
		this.errorStream.WriteLine(s);
		this.count++;
	}
	
	public WarningPositioned (line : number, col : number, s : string) {
		this.errorStream.WriteFormattedLine(this.errMsgFormat, line, col, s);
	}
	
	public Warning(s : string) {
		this.errorStream.WriteLine(s);
	}
} // Errors
}