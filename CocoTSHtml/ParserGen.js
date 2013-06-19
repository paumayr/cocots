var at;
(function (at) {
    (function (jku) {
        (function (ssw) {
            (function (Coco) {
                var ParserGen = (function () {
                    function ParserGen(parser) {
                        this.symSet = [];
                        tab = parser.tab;
                        errors = parser.errors;
                        trace = parser.trace;
                        buffer = parser.scanner.buffer;
                        errorNr = -1;
                        usingPos = null;
                    }
                    ParserGen.maxTerm = 3;
                    ParserGen.CR = '\r';
                    ParserGen.LF = '\n';
                    ParserGen.EOF = -1;
                    ParserGen.tErr = 0;
                    ParserGen.altErr = 1;
                    ParserGen.syncErr = 2;
                    ParserGen.prototype.Indent = function (n) {
                        for(var i = 1; i <= n; i++) {
                            this.gen.Write('\t');
                        }
                    };
                    ParserGen.prototype.Overlaps = function (s1, s2) {
                        var len = s1.Count;
                        for(var i = 0; i < len; ++i) {
                            if(s1[i] && s2[i]) {
                                return true;
                            }
                        }
                        return false;
                    };
                    ParserGen.prototype.UseSwitch = function (p) {
                        var s1;
                        var s2;
                        if(p.typ != Node.alt) {
                            return false;
                        }
                        var nAlts = 0;
                        s1 = new BitArray(this.tab.terminals.length);
                        while(p != null) {
                            s2 = this.tab.Expected0(p.sub, this.curSy);
                            if(this.Overlaps(s1, s2)) {
                                return false;
                            }
                            s1.Or(s2);
                            ++nAlts;
                            if(p.sub.typ == Node.rslv) {
                                return false;
                            }
                            p = p.down;
                        }
                        return nAlts > 5;
                    };
                    ParserGen.prototype.CopySourcePart = function (pos, indent) {
                        var ch;
                        var i;
                        if(pos != null) {
                            this.buffer.Pos = pos.beg;
                            ch = this.buffer.Read();
                            if(this.tab.emitLines) {
                                this.gen.WriteLine();
                                this.gen.WriteLineFormatted2("#line {0} \"{1}\"", pos.line, this.tab.srcName);
                            }
                            this.Indent(indent);
                            var done = false;
                            while(!done && this.buffer.Pos <= pos.end) {
                                while(ch == ParserGen.CR || ch == ParserGen.LF) {
                                    this.gen.WriteLine();
                                    this.Indent(indent);
                                    if(ch == ParserGen.CR) {
                                        ch = this.buffer.Read();
                                    }
                                    if(ch == ParserGen.LF) {
                                        ch = this.buffer.Read();
                                    }
                                    for(i = 1; i <= pos.col && (ch == ' ' || ch == '\t'); i++) {
                                        ch = this.buffer.Read();
                                    }
                                    if(this.buffer.Pos > pos.end) {
                                        done = true;
                                        break;
                                    }
                                    ;
                                }
                                if(!done) {
                                    this.gen.Write(ch);
                                    ch = this.buffer.Read();
                                }
                            }
                            if(indent > 0) {
                                this.gen.WriteLine();
                            }
                        }
                    };
                    ParserGen.prototype.GenErrorMsg = function (errTyp, sym) {
                        this.errorNr++;
                        this.err.Write("\t\t\tcase " + this.errorNr + ": s = \"");
                        switch(errTyp) {
                            case ParserGen.tErr:
                                if(sym.name[0] == '"') {
                                    this.err.Write(this.tab.Escape(sym.name) + " expected");
                                } else {
                                    this.err.Write(sym.name + " expected");
                                }
                                break;
                            case ParserGen.altErr:
                                this.err.Write("invalid " + sym.name);
                                break;
                            case ParserGen.syncErr:
                                this.err.Write("this symbol not expected in " + sym.name);
                                break;
                        }
                        this.err.WriteLine("\"; break;");
                    };
                    ParserGen.prototype.NewCondSet = function (s) {
                        for(var i = 1; i < this.symSet.length; i++) {
                            if(Sets.Equals(s, this.symSet[i])) {
                                return i;
                            }
                        }
                        this.symSet.push(s.Clone());
                        return this.symSet.length - 1;
                    };
                    ParserGen.prototype.GenCond = function (s, p) {
                        if(p.typ == Node.rslv) {
                            this.CopySourcePart(p.pos, 0);
                        } else {
                            var n = Sets.Elements(s);
                            if(n == 0) {
                                this.gen.Write("false");
                            } else if(n <= ParserGen.maxTerm) {
                                for(var i = 0; i < this.tab.terminals.length; i++) {
                                    var sym = this.tab.terminals[i];
                                    if(s[sym.n]) {
                                        this.gen.WriteFormatted1("this.la.kind == {0}", sym.n);
                                        --n;
                                        if(n > 0) {
                                            this.gen.Write(" || ");
                                        }
                                    }
                                }
                            } else {
                                this.gen.WriteFormatted1("this.StartOf({0})", this.NewCondSet(s));
                            }
                        }
                    };
                    ParserGen.prototype.PutCaseLabels = function (s) {
                        for(var i = 0; i < this.tab.terminals.length; i++) {
                            var sym = this.tab.terminals[i];
                            if(s[sym.n]) {
                                this.gen.WriteFormatted1("case {0}: ", sym.n);
                            }
                        }
                    };
                    ParserGen.prototype.GenCode = function (p, indent, isChecked) {
                        var p2;
                        var s1;
                        var s2;
                        while(p != null) {
                            switch(p.typ) {
                                case Node.nt: {
                                    this.Indent(indent);
                                    this.gen.Write("var ");
                                    this.CopySourcePart(p.pos, 0);
                                    this.gen.Write(" = ");
                                    this.gen.Write("this." + p.sym.name + "(");
                                    this.gen.WriteLineText(");");
                                    break;
                                }
                                case Node.t: {
                                    this.Indent(indent);
                                    if(isChecked[p.sym.n]) {
                                        this.gen.WriteLineText("this.Get();");
                                    } else {
                                        this.gen.WriteLineFormatted1("this.Expect({0});", p.sym.n);
                                    }
                                    break;
                                }
                                case Node.wt: {
                                    this.Indent(indent);
                                    s1 = this.tab.Expected(p.next, this.curSy);
                                    s1.Or(this.tab.allSyncSets);
                                    this.gen.WriteLineFormatted2("this.ExpectWeak({0}, {1});", p.sym.n, this.NewCondSet(s1));
                                    break;
                                }
                                case Node.any: {
                                    this.Indent(indent);
                                    var acc = Sets.Elements(p.set);
                                    if(this.tab.terminals.length == (acc + 1) || (acc > 0 && Sets.Equals(p.set, isChecked))) {
                                        this.gen.WriteLineText("this.Get();");
                                    } else {
                                        this.GenErrorMsg(ParserGen.altErr, this.curSy);
                                        if(acc > 0) {
                                            this.gen.Write("if (");
                                            this.GenCond(p.set, p);
                                            this.gen.WriteLineFormatted1(") this.Get(); else this.SynErr({0});", this.errorNr);
                                        } else {
                                            this.gen.WriteLineFormatted1("this.SynErr({0}); // ANY node that matches no symbol", this.errorNr);
                                        }
                                    }
                                    break;
                                }
                                case Node.eps:
                                    break;
                                case Node.rslv:
                                    break;
                                case Node.sem: {
                                    this.CopySourcePart(p.pos, indent);
                                    break;
                                }
                                case Node.sync: {
                                    this.Indent(indent);
                                    this.GenErrorMsg(ParserGen.syncErr, this.curSy);
                                    s1 = p.set.Clone();
                                    this.gen.Write("while (!(");
                                    this.GenCond(s1, p);
                                    this.gen.Write(")) {");
                                    this.gen.WriteFormatted1("this.SynErr({0}); Get(); ", this.errorNr);
                                    this.gen.WriteLineText("}");
                                    break;
                                }
                                case Node.alt: {
                                    s1 = this.tab.First(p);
                                    var equal = Sets.Equals(s1, isChecked);
                                    var useSwitch = this.UseSwitch(p);
                                    if(useSwitch) {
                                        this.Indent(indent);
                                        this.gen.WriteLineText("switch (this.la.kind) {");
                                    }
                                    p2 = p;
                                    while(p2 != null) {
                                        s1 = this.tab.Expected(p2.sub, this.curSy);
                                        this.Indent(indent);
                                        if(useSwitch) {
                                            this.PutCaseLabels(s1);
                                            this.gen.WriteLineText("{");
                                        } else if(p2 == p) {
                                            this.gen.Write("if (");
                                            this.GenCond(s1, p2.sub);
                                            this.gen.WriteLineText(") {");
                                        } else if(p2.down == null && equal) {
                                            this.gen.WriteLineText("} else {");
                                        } else {
                                            this.gen.Write("} else if (");
                                            this.GenCond(s1, p2.sub);
                                            this.gen.WriteLineText(") {");
                                        }
                                        this.GenCode(p2.sub, indent + 1, s1);
                                        if(useSwitch) {
                                            this.Indent(indent);
                                            this.gen.WriteLineText("\tbreak;");
                                            this.Indent(indent);
                                            this.gen.WriteLineText("}");
                                        }
                                        p2 = p2.down;
                                    }
                                    this.Indent(indent);
                                    if(equal) {
                                        this.gen.WriteLineText("}");
                                    } else {
                                        this.GenErrorMsg(ParserGen.altErr, this.curSy);
                                        if(useSwitch) {
                                            this.gen.WriteLineFormatted1("default: this.SynErr({0}); break;", this.errorNr);
                                            this.Indent(indent);
                                            this.gen.WriteLineText("}");
                                        } else {
                                            this.gen.Write("} ");
                                            this.gen.WriteLineFormatted1("else this.SynErr({0});", this.errorNr);
                                        }
                                    }
                                    break;
                                }
                                case Node.iter: {
                                    this.Indent(indent);
                                    p2 = p.sub;
                                    this.gen.Write("while (");
                                    if(p2.typ == Node.wt) {
                                        s1 = this.tab.Expected(p2.next, this.curSy);
                                        s2 = this.tab.Expected(p.next, this.curSy);
                                        this.gen.WriteFormatted3("this.WeakSeparator({0},{1},{2}) ", p2.sym.n, this.NewCondSet(s1), this.NewCondSet(s2));
                                        s1 = new BitArray(this.tab.terminals.length);
                                        if(p2.up || p2.next == null) {
                                            p2 = null;
                                        } else {
                                            p2 = p2.next;
                                        }
                                    } else {
                                        s1 = this.tab.First(p2);
                                        this.GenCond(s1, p2);
                                    }
                                    this.gen.WriteLineText(") {");
                                    this.GenCode(p2, indent + 1, s1);
                                    this.Indent(indent);
                                    this.gen.WriteLineText("}");
                                    break;
                                }
                                case Node.opt:
                                    s1 = this.tab.First(p.sub);
                                    this.Indent(indent);
                                    this.gen.Write("if (");
                                    this.GenCond(s1, p.sub);
                                    this.gen.WriteLineText(") {");
                                    this.GenCode(p.sub, indent + 1, s1);
                                    this.Indent(indent);
                                    this.gen.WriteLineText("}");
                                    break;
                            }
                            if(p.typ != Node.eps && p.typ != Node.sem && p.typ != Node.sync) {
                                isChecked.SetAll(false);
                            }
                            if(p.up) {
                                break;
                            }
                            p = p.next;
                        }
                    };
                    ParserGen.prototype.GenTokens = function () {
                        for(var i = 0; i < this.tab.terminals.length; i++) {
                            var sym = this.tab.terminals[i];
                            if(isLetter(sym.name[0])) {
                                this.gen.WriteLineFormatted2("\tpublic static _{0} : number = {1};", sym.name, sym.n);
                            }
                        }
                    };
                    ParserGen.prototype.GenPragmas = function () {
                        for(var i = 0; i < this.tab.pragmas.length; i++) {
                            var sym = this.tab.pragmas[i];
                            this.gen.WriteLineFormatted2("\tpublic static _{0} : number = {1};", sym.name, sym.n);
                        }
                    };
                    ParserGen.prototype.GenCodePragmas = function () {
                        for(var i = 0; i < this.tab.pragmas.length; i++) {
                            var sym = this.tab.pragmas[i];
                            this.gen.WriteLineFormatted1("\t\t\t\tif (this.la.kind == {0}) {{", sym.n);
                            this.CopySourcePart(sym.semPos, 4);
                            this.gen.WriteLineText("\t\t\t\t}");
                        }
                    };
                    ParserGen.prototype.GenProductions = function () {
                        for(var i = 0; i < this.tab.nonterminals.length; i++) {
                            var sym = this.tab.nonterminals[i];
                            this.curSy = sym;
                            this.gen.WriteFormatted1("\t{0}() ", sym.name);
                            this.gen.Write(" : {");
                            this.CopySourcePart(sym.attrPos, 0);
                            this.gen.WriteLineText(" } ");
                            this.Indent(1);
                            this.gen.WriteLineText(" { ");
                            this.Indent(2);
                            this.gen.Write("var ret : { ");
                            this.CopySourcePart(sym.attrPos, 0);
                            this.gen.WriteLineText("};");
                            this.CopySourcePart(sym.semPos, 2);
                            this.GenCode(sym.graph, 2, new BitArray(this.tab.terminals.length));
                            this.gen.WriteLineText("\t\treturn ret;");
                            this.gen.WriteLineText("\t}");
                        }
                    };
                    ParserGen.prototype.InitSets = function () {
                        for(var i = 0; i < this.symSet.length; i++) {
                            var s = this.symSet[i];
                            this.gen.Write("\t\t[");
                            for(var j = 0; j < this.tab.terminals.length; j++) {
                                var sym = this.tab.terminals[j];
                                if(s[sym.n]) {
                                    this.gen.Write("true,");
                                } else {
                                    this.gen.Write("false,");
                                }
                                if(j % 4 == 0) {
                                    this.gen.Write(" ");
                                }
                            }
                            if(i == this.symSet.length - 1) {
                                this.gen.WriteLineText("false]");
                            } else {
                                this.gen.WriteLineText("false],");
                            }
                        }
                    };
                    ParserGen.prototype.WriteParser = function () {
                        var g = new Coco.Generator(this.tab);
                        var oldPos = this.buffer.Pos;
                        this.symSet.push(this.tab.allSyncSets);
                        this.fram = g.OpenFrame("Parser.frame");
                        this.gen = g.OpenGen("Parser.ts");
                        this.err = new StringWriter();
                        for(var i = 0; i < this.tab.terminals.length; i++) {
                            var sym = this.tab.terminals[i];
                            this.GenErrorMsg(ParserGen.tErr, sym);
                        }
                        g.GenCopyright();
                        g.SkipFramePart("-->begin");
                        if(this.usingPos != null) {
                            this.CopySourcePart(this.usingPos, 0);
                            this.gen.WriteLine();
                        }
                        g.CopyFramePart("-->namespace");
                        if(this.tab.nsName != null && this.tab.nsName.length > 0) {
                            this.gen.WriteLineFormatted1("module {0} {{", this.tab.nsName);
                            this.gen.WriteLine();
                        }
                        g.CopyFramePart("-->constants");
                        this.GenTokens();
                        this.gen.WriteLineFormatted1("\tpublic static maxT : number = {0};", this.tab.terminals.length - 1);
                        this.GenPragmas();
                        g.CopyFramePart("-->declarations");
                        this.CopySourcePart(this.tab.semDeclPos, 0);
                        g.CopyFramePart("-->pragmas");
                        this.GenCodePragmas();
                        g.CopyFramePart("-->productions");
                        this.GenProductions();
                        g.CopyFramePart("-->parseRoot");
                        this.gen.WriteLineFormatted1("\t\tthis.{0}();", this.tab.gramSy.name);
                        if(this.tab.checkEOF) {
                            this.gen.WriteLineText("\t\tthis.Expect(0);");
                        }
                        g.CopyFramePart("-->initialization");
                        this.InitSets();
                        g.CopyFramePart("-->errors");
                        this.gen.Write(this.err.ToString());
                        g.CopyFramePart(null);
                        if(this.tab.nsName != null && this.tab.nsName.length > 0) {
                            this.gen.Write("}");
                        }
                        this.gen.Close();
                        this.buffer.Pos = oldPos;
                    };
                    ParserGen.prototype.WriteStatistics = function () {
                        this.trace.WriteLine();
                        this.trace.WriteLineFormatted1("{0} terminals", this.tab.terminals.length);
                        this.trace.WriteLineFormatted1("{0} symbols", this.tab.terminals.length + this.tab.pragmas.length + this.tab.nonterminals.length);
                        this.trace.WriteLineFormatted1("{0} nodes", tab.nodes.Count);
                        this.trace.WriteLineFormatted1("{0} sets", symSet.Count);
                    };
                    return ParserGen;
                })();
                Coco.ParserGen = ParserGen;                
            })(ssw.Coco || (ssw.Coco = {}));
            var Coco = ssw.Coco;
        })(jku.ssw || (jku.ssw = {}));
        var ssw = jku.ssw;
    })(at.jku || (at.jku = {}));
    var jku = at.jku;
})(at || (at = {}));
