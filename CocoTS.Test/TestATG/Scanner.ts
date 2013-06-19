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

export class Token {
	kind : number;    // token kind
	pos : number;     // token position in bytes in the source text (starting at 0)
	charPos : number;  // token position in characters in the source text (starting at 0)
	col : number;     // token column (starting at 1)
	line : number;    // token line (starting at 1)
	val : string;  // token value
	next : Token;  // ML 2005-03-11 Tokens are kept in linked list
}

//-----------------------------------------------------------------------------------
// Buffer
//-----------------------------------------------------------------------------------
export class Buffer {
	public static EOF : string = "\0";
	public buf : string;         // input buffer
	public fileLen : number;
	public pos : number;

	constructor (s : string) {
		this.buf = s;
		this.fileLen = s.length;
		this.pos = 0;
	}

	public Read () : string {
		if (this.pos < this.fileLen)
		{
			return this.buf[this.pos++];
		}
		else
		{
			return Buffer.EOF;
		}
	}

	public Peek () : string {
		var curPos = this.Pos;
		var ch = this.Read();
		this.Pos = curPos;
		return ch;
	}
	
	// beg .. begin, zero-based, inclusive, in byte
	// end .. end, zero-based, exclusive, in byte
	public GetString (beg : number, end : number) : string {
		return this.buf.substring(beg, end);
	}

	get Pos() : number { return this.pos; }
	set Pos (value : number) { this.pos = value; }
}

//-----------------------------------------------------------------------------------
// Scanner
//-----------------------------------------------------------------------------------
export class Scanner {
	public static EOL : string = "\n";
	public static eofSym : number = 0;
	static maxT : number = 12;
	static noSym : number = 12;


	public buffer : Buffer; // scanner buffer
	
	t : Token;          // current token
	ch : string;           // current input character
	pos : number;          // byte position of current character
	charPos : number;      // position by unicode characters starting with 0
	col : number;          // column number of current character
	line : number;         // line number of current character
	oldEols : number;      // EOLs that appeared in a comment;
	static start : any; // maps first token character to start state

	tokens : Token;     // list of tokens already peeked (first token is a dummy)
	pt : Token;         // current peek token
	
	tval = []; // text of current token // TODO use TS 0.9 generics
	
	static InitStartTab() {
		Scanner.start = {};
		for (var i : number = 65; i <= 90; ++i) Scanner.start[String.fromCharCode(i)] = 1;
		for (var i : number = 97; i <= 122; ++i) Scanner.start[String.fromCharCode(i)] = 1;
		for (var i : number = 48; i <= 57; ++i) Scanner.start[String.fromCharCode(i)] = 2;
		Scanner.start['+'] = 3; 
		Scanner.start['-'] = 4; 
		Scanner.start['*'] = 5; 
		Scanner.start['/'] = 6; 
		Scanner.start['<'] = 7; 
		Scanner.start['>'] = 8; 
		Scanner.start['='] = 9; 
		Scanner.start[Buffer.EOF] = -1;

	}
	
	
	constructor(s : string) {
		this.buffer = new Buffer(s);
		this.Init();
	}
	
	Init() {
		this.pos = -1; 
		this.line = 1; 
		this.col = 0; 
		this.charPos = -1;
		this.oldEols = 0;
		this.NextCh();
		this.pt = this.tokens = new Token();  // first token is a dummy
	}
	
	NextCh() {
		if (this.oldEols > 0) 
		{
			this.ch = Scanner.EOL;
			this.oldEols--;
		}
		else 
		{
			this.pos = this.buffer.Pos;
			// buffer reads unicode chars, if UTF8 has been detected
			this.ch = this.buffer.Read(); 
			this.col++; 
			this.charPos++;
			// replace isolated '\r' by '\n' in order to make
			// eol handling uniform across Windows, Unix and Mac
			if (this.ch == "\r" && this.buffer.Peek() != "\n")
			{
				this.ch = Scanner.EOL;
			}

			if (this.ch == Scanner.EOL)
			{
				this.line++;
				this.col = 0;
			}
		}

	}

	AddCh() {
		if (this.ch != Buffer.EOF)
		{
			this.tval.push(this.ch);

			this.NextCh();
		}
	}



	Comment0() : bool{
		var level = 1; var pos0 = this.pos; var line0 = this.line; var col0 = this.col; var charPos0 = this.charPos;
		this.NextCh();
		if (this.ch == '/') {
			this.NextCh();
			for(;;) {
				if (this.ch == "\u0010") {
					level--;
					if (level == 0) { this.oldEols = this.line - line0; this.NextCh(); return true; }
					this.NextCh();
				} else if (this.ch == Buffer.EOF) return false;
				else this.NextCh();
			}
		} else {
			this.buffer.Pos = pos0; this.NextCh(); this.line = line0; this.col = col0; this.charPos = charPos0;
		}
		return false;
	}

	Comment1() : bool{
		var level = 1; var pos0 = this.pos; var line0 = this.line; var col0 = this.col; var charPos0 = this.charPos;
		this.NextCh();
		if (this.ch == '*') {
			this.NextCh();
			for(;;) {
				if (this.ch == '*') {
					this.NextCh();
					if (this.ch == '/') {
						level--;
						if (level == 0) { this.oldEols = this.line - line0; this.NextCh(); return true; }
						this.NextCh();
					}
				} else if (this.ch == '/') {
					this.NextCh();
					if (this.ch == '*') {
						level++; this.NextCh();
					}
				} else if (this.ch == Buffer.EOF) return false;
				else this.NextCh();
			}
		} else {
			this.buffer.Pos = pos0; this.NextCh(); this.line = line0; this.col = col0; this.charPos = charPos0;
		}
		return false;
	}


	CheckLiteral() {
		switch (this.t.val) {
			case "true": this.t.kind = 10; break;
			case "false": this.t.kind = 11; break;
			default: break;
		}
	}

	NextToken() : Token {
		while (this.ch == " " ||
			this.ch >= "\u0009" && this.ch <= "\u0010" || this.ch == "\u0013"
		) this.NextCh();
		if (this.ch == '/' && this.Comment0() ||this.ch == '/' && this.Comment1()) return this.NextToken();
		var recKind = Scanner.noSym;
		var recEnd = this.pos;
		this.t = new Token();
		this.t.pos = this.pos;
		this.t.col = this.col;
		this.t.line = this.line;
		this.t.charPos = this.charPos;
		var state : number;
		if (Scanner.start[this.ch] != undefined) {
			state = Scanner.start[this.ch];
		}
		else
		{ 
			state = 0;
		}
		
		this.tval = [];
		this.AddCh();
		
		var done : bool = false;
		while(!done)
		{
			done = true;
		switch (state) {
			case -1: 
			{ 
				this.t.kind = Scanner.eofSym; 
				break; 
			} // NextCh already done
			case 0:
			{
				if (recKind != Scanner.noSym) {
					this.tval = this.tval.slice(0, recEnd);
					this.SetScannerBehindT();
				}
				this.t.kind = recKind; 
				break;
			} // NextCh already done
			case 1:
				recEnd = this.pos; recKind = 1;
				if (this.ch >= '0' && this.ch <= '9' || this.ch >= 'A' && this.ch <= 'Z' || this.ch >= 'a' && this.ch <= 'z') {this.AddCh(); state = 1; done = false; break;}
				else {this.t.kind = 1; this.t.val = this.tval.join(""); this.CheckLiteral(); return this.t;}
			case 2:
				recEnd = this.pos; recKind = 2;
				if (this.ch >= '0' && this.ch <= '9') {this.AddCh(); state = 2; done = false; break;}
				else {this.t.kind = 2; break;}
			case 3:
				{this.t.kind = 3; break;}
			case 4:
				{this.t.kind = 4; break;}
			case 5:
				{this.t.kind = 5; break;}
			case 6:
				{this.t.kind = 6; break;}
			case 7:
				{this.t.kind = 7; break;}
			case 8:
				{this.t.kind = 8; break;}
			case 9:
				if (this.ch == '=') {this.AddCh(); state = 10; done = false; break;}
				else {state = 0; done = false; break;}
			case 10:
				{this.t.kind = 9; break;}

		}
		}

		this.t.val = this.tval.join("");
		return this.t;
	}
	
	private SetScannerBehindT() {
		this.buffer.Pos = this.t.pos;
		this.NextCh();
		this.line = this.t.line; 
		this.col = this.t.col; 
		this.charPos = this.t.charPos;
		for (var i : number = 0; i < this.tval.length; i++) this.NextCh();
	}
	
	// get the next token (possibly a token already seen during peeking)
	public Scan () : Token {
		if (this.tokens.next == null) {
			return this.NextToken();
		} else {
			this.pt = this.tokens = this.tokens.next;
			return this.tokens;
		}
	}

	// peek for the next token, ignore pragmas
	public Peek () : Token{
		do {
			if (this.pt.next == null) {
				this.pt.next = this.NextToken();
			}
			this.pt = this.pt.next;
		} while (this.pt.kind > Scanner.maxT); // skip pragmas
	
		return this.pt;
	}

	// make sure that peeking starts at the current scan position
	public ResetPeek () { this.pt = this.tokens; }

} // end Scanner
Scanner.InitStartTab();
}