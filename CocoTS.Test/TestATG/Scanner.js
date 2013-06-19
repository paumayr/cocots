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
    var Token = (function () {
        function Token() {
        }
        return Token;
    })();
    testlanguage.Token = Token;

    //-----------------------------------------------------------------------------------
    // Buffer
    //-----------------------------------------------------------------------------------
    var Buffer = (function () {
        function Buffer(s) {
            this.buf = s;
            this.fileLen = s.length;
            this.pos = 0;
        }
        Buffer.prototype.Read = function () {
            if (this.pos < this.fileLen) {
                return this.buf[this.pos++];
            } else {
                return Buffer.EOF;
            }
        };

        Buffer.prototype.Peek = function () {
            var curPos = this.Pos;
            var ch = this.Read();
            this.Pos = curPos;
            return ch;
        };

        // beg .. begin, zero-based, inclusive, in byte
        // end .. end, zero-based, exclusive, in byte
        Buffer.prototype.GetString = function (beg, end) {
            return this.buf.substring(beg, end);
        };

        Object.defineProperty(Buffer.prototype, "Pos", {
            get: function () {
                return this.pos;
            },
            set: function (value) {
                this.pos = value;
            },
            enumerable: true,
            configurable: true
        });
        Buffer.EOF = "\0";
        return Buffer;
    })();
    testlanguage.Buffer = Buffer;

    //-----------------------------------------------------------------------------------
    // Scanner
    //-----------------------------------------------------------------------------------
    var Scanner = (function () {
        function Scanner(s) {
            this.tval = [];
            this.buffer = new Buffer(s);
            this.Init();
        }
        Scanner.InitStartTab = function () {
            start = {};
            for (var i = 65; i <= 90; ++i)
                start[String.fromCharCode(i)] = 1;
            for (var i = 97; i <= 122; ++i)
                start[String.fromCharCode(i)] = 1;
            for (var i = 48; i <= 57; ++i)
                start[String.fromCharCode(i)] = 2;
            start['+'] = 3;
            start['-'] = 4;
            start['*'] = 5;
            start['/'] = 6;
            start['<'] = 7;
            start['>'] = 8;
            start['='] = 9;
            start[Buffer.EOF] = -1;
        };

        Scanner.prototype.Init = function () {
            this.pos = -1;
            this.line = 1;
            this.col = 0;
            this.charPos = -1;
            this.oldEols = 0;
            this.NextCh();
            this.pt = this.tokens = new Token();
        };

        Scanner.prototype.NextCh = function () {
            if (this.oldEols > 0) {
                this.ch = Scanner.EOL;
                this.oldEols--;
            } else {
                this.pos = this.buffer.Pos;

                // buffer reads unicode chars, if UTF8 has been detected
                this.ch = this.buffer.Read();
                this.col++;
                this.charPos++;

                if (this.ch == "\r" && this.buffer.Peek() != "\n") {
                    this.ch = Scanner.EOL;
                }

                if (this.ch == Scanner.EOL) {
                    this.line++;
                    this.col = 0;
                }
            }
        };

        Scanner.prototype.AddCh = function () {
            if (this.ch != Buffer.EOF) {
                this.tval.push(this.ch);

                this.NextCh();
            }
        };

        Scanner.prototype.Comment0 = function () {
            var level = 1;
            var pos0 = this.pos;
            var line0 = this.line;
            var col0 = this.col;
            var charPos0 = this.charPos;
            this.NextCh();
            if (this.ch == '/') {
                this.NextCh();
                for (; ; ) {
                    if (this.ch == "\u0010") {
                        level--;
                        if (level == 0) {
                            this.oldEols = this.line - line0;
                            this.NextCh();
                            return true;
                        }
                        this.NextCh();
                    } else if (this.ch == Buffer.EOF)
                        return false; else
                        this.NextCh();
                }
            } else {
                this.buffer.Pos = pos0;
                this.NextCh();
                this.line = line0;
                this.col = col0;
                this.charPos = charPos0;
            }
            return false;
        };

        Scanner.prototype.Comment1 = function () {
            var level = 1;
            var pos0 = this.pos;
            var line0 = this.line;
            var col0 = this.col;
            var charPos0 = this.charPos;
            this.NextCh();
            if (this.ch == '*') {
                this.NextCh();
                for (; ; ) {
                    if (this.ch == '*') {
                        this.NextCh();
                        if (this.ch == '/') {
                            level--;
                            if (level == 0) {
                                this.oldEols = this.line - line0;
                                this.NextCh();
                                return true;
                            }
                            this.NextCh();
                        }
                    } else if (this.ch == '/') {
                        this.NextCh();
                        if (this.ch == '*') {
                            level++;
                            this.NextCh();
                        }
                    } else if (this.ch == Buffer.EOF)
                        return false; else
                        this.NextCh();
                }
            } else {
                this.buffer.Pos = pos0;
                this.NextCh();
                this.line = line0;
                this.col = col0;
                this.charPos = charPos0;
            }
            return false;
        };

        Scanner.prototype.CheckLiteral = function () {
            switch (this.t.val) {
                case "true":
                    this.t.kind = 10;
                    break;
                case "false":
                    this.t.kind = 11;
                    break;
                default:
                    break;
            }
        };

        Scanner.prototype.NextToken = function () {
            while (this.ch == " " || this.ch >= "\u0009" && this.ch <= "\u0010" || this.ch == "\u0013")
                this.NextCh();
            if (this.ch == '/' && this.Comment0() || this.ch == '/' && this.Comment1())
                return this.NextToken();
            var recKind = Scanner.noSym;
            var recEnd = this.pos;
            this.t = new Token();
            this.t.pos = this.pos;
            this.t.col = this.col;
            this.t.line = this.line;
            this.t.charPos = this.charPos;
            var state;
            if (Scanner.start[this.ch] != undefined) {
                state = Scanner.start[this.ch];
            } else {
                state = 0;
            }

            this.tval = [];
            this.AddCh();

            var done = false;
            while (!done) {
                done = true;
                switch (state) {
                    case -1: {
                        this.t.kind = Scanner.eofSym;
                        break;
                    }
                    case 0: {
                        if (recKind != Scanner.noSym) {
                            this.tval = this.tval.slice(0, recEnd);
                            this.SetScannerBehindT();
                        }
                        this.t.kind = recKind;
                        break;
                    }
                    case 1:
                        recEnd = this.pos;
                        recKind = 1;
                        if (this.ch >= '0' && this.ch <= '9' || this.ch >= 'A' && this.ch <= 'Z' || this.ch >= 'a' && this.ch <= 'z') {
                            this.AddCh();
                            state = 1;
                            done = false;
                            break;
                        } else {
                            this.t.kind = 1;
                            this.t.val = this.tval.join("");
                            this.CheckLiteral();
                            return this.t;
                        }
                    case 2:
                        recEnd = this.pos;
                        recKind = 2;
                        if (this.ch >= '0' && this.ch <= '9') {
                            this.AddCh();
                            state = 2;
                            done = false;
                            break;
                        } else {
                            this.t.kind = 2;
                            break;
                        }
                    case 3: {
                        this.t.kind = 3;
                        break;
                    }
                    case 4: {
                        this.t.kind = 4;
                        break;
                    }
                    case 5: {
                        this.t.kind = 5;
                        break;
                    }
                    case 6: {
                        this.t.kind = 6;
                        break;
                    }
                    case 7: {
                        this.t.kind = 7;
                        break;
                    }
                    case 8: {
                        this.t.kind = 8;
                        break;
                    }
                    case 9:
                        if (this.ch == '=') {
                            this.AddCh();
                            state = 10;
                            done = false;
                            break;
                        } else {
                            state = 0;
                            done = false;
                            break;
                        }
                    case 10: {
                        this.t.kind = 9;
                        break;
                    }
                }
            }

            this.t.val = this.tval.join("");
            return this.t;
        };

        Scanner.prototype.SetScannerBehindT = function () {
            this.buffer.Pos = this.t.pos;
            this.NextCh();
            this.line = this.t.line;
            this.col = this.t.col;
            this.charPos = this.t.charPos;
            for (var i = 0; i < this.tval.length; i++)
                this.NextCh();
        };

        // get the next token (possibly a token already seen during peeking)
        Scanner.prototype.Scan = function () {
            if (this.tokens.next == null) {
                return this.NextToken();
            } else {
                this.pt = this.tokens = this.tokens.next;
                return this.tokens;
            }
        };

        // peek for the next token, ignore pragmas
        Scanner.prototype.Peek = function () {
            do {
                if (this.pt.next == null) {
                    this.pt.next = this.NextToken();
                }
                this.pt = this.pt.next;
            } while(this.pt.kind > Scanner.maxT);

            return this.pt;
        };

        // make sure that peeking starts at the current scan position
        Scanner.prototype.ResetPeek = function () {
            this.pt = this.tokens;
        };
        Scanner.EOL = "\n";
        Scanner.eofSym = 0;
        Scanner.maxT = 12;
        Scanner.noSym = 12;
        return Scanner;
    })();
    testlanguage.Scanner = Scanner;
    Scanner.InitStartTab();
})(testlanguage || (testlanguage = {}));
//@ sourceMappingURL=Scanner.js.map
