var at;
(function (at) {
    (function (jku) {
        (function (ssw) {
            (function (Coco) {
                var State = (function () {
                    function State() { }
                    State.prototype.AddAction = function (act) {
                        var lasta = null;
                        var a = this.firstAction;
                        while(a != null && act.typ >= a.typ) {
                            lasta = a;
                            a = a.next;
                        }
                        act.next = a;
                        if(a == this.firstAction) {
                            this.firstAction = act;
                        } else {
                            lasta.next = act;
                        }
                    };
                    State.prototype.DetachAction = function (act) {
                        var lasta = null;
                        var a = this.firstAction;
                        while(a != null && a != act) {
                            lasta = a;
                            a = a.next;
                        }
                        if(a != null) {
                            if(a == this.firstAction) {
                                this.firstAction = a.next;
                            } else {
                                lasta.next = a.next;
                            }
                        }
                    };
                    State.prototype.MeltWith = function (s) {
                        for(var action = s.firstAction; action != null; action = action.next) {
                            var a = new Action(action.typ, action.sym, action.tc);
                            a.AddTargets(action);
                            this.AddAction(a);
                        }
                    };
                    return State;
                })();
                Coco.State = State;                
                var Action = (function () {
                    function Action(typ, sym, tc) {
                        this.typ = typ;
                        this.sym = sym;
                        this.tc = tc;
                    }
                    Action.prototype.AddTarget = function (t) {
                        var last = null;
                        var p = this.target;
                        while(p != null && t.state.nr >= p.state.nr) {
                            if(t.state == p.state) {
                                return;
                            }
                            last = p;
                            p = p.next;
                        }
                        t.next = p;
                        if(p == this.target) {
                            this.target = t;
                        } else {
                            last.next = t;
                        }
                    };
                    Action.prototype.AddTargets = function (a) {
                        for(var p = a.target; p != null; p = p.next) {
                            var t = new Target(p.state);
                            this.AddTarget(t);
                        }
                        if(a.tc == Node.contextTrans) {
                            this.tc = Node.contextTrans;
                        }
                    };
                    Action.prototype.Symbols = function (tab) {
                        var s;
                        if(this.typ == Node.clas) {
                            s = tab.CharClassSet(this.sym).Clone();
                        } else {
                            s = new CharSet();
                            s.Set(this.sym);
                        }
                        return s;
                    };
                    Action.prototype.ShiftWith = function (s, tab) {
                        if(s.Elements() == 1) {
                            this.typ = Node.chr;
                            this.sym = s.First();
                        } else {
                            var c = tab.FindCharClassCS(s);
                            if(c == null) {
                                c = tab.NewCharClass("#", s);
                            }
                            this.typ = Node.clas;
                            this.sym = c.n;
                        }
                    };
                    return Action;
                })();
                Coco.Action = Action;                
                var Target = (function () {
                    function Target(s) {
                        this.state = s;
                    }
                    return Target;
                })();
                Coco.Target = Target;                
                var Melted = (function () {
                    function Melted(set, state) {
                        this.set = set;
                        this.state = state;
                        this.next = null;
                    }
                    return Melted;
                })();
                Coco.Melted = Melted;                
                var Comment = (function () {
                    function Comment(start, stop, nested) {
                        this.start = start;
                        this.stop = stop;
                        this.nested = nested;
                        this.next = null;
                    }
                    return Comment;
                })();
                Coco.Comment = Comment;                
                var Range = (function () {
                    function Range(from, to) {
                        this.from = from;
                        this.to = to;
                        this.next = null;
                    }
                    return Range;
                })();
                Coco.Range = Range;                
                var CharSet = (function () {
                    function CharSet() { }
                    CharSet.prototype.get = function (i) {
                        for(var p = this.head; p != null; p = p.next) {
                            if(i < p.from) {
                                return false;
                            } else if(i <= p.to) {
                                return true;
                            }
                        }
                        return false;
                    };
                    CharSet.prototype.Set = function (i) {
                        var cur = this.head;
                        var prev = null;
                        while(cur != null && i >= cur.from - 1) {
                            if(i <= cur.to + 1) {
                                if(i == cur.from - 1) {
                                    cur.from--;
                                } else if(i == cur.to + 1) {
                                    cur.to++;
                                    var next = cur.next;
                                    if(next != null && cur.to == next.from - 1) {
                                        cur.to = next.to;
                                        cur.next = next.next;
                                    }
                                    ;
                                }
                                return;
                            }
                            prev = cur;
                            cur = cur.next;
                        }
                        var n = new Range(i, i);
                        n.next = cur;
                        if(prev == null) {
                            this.head = n;
                        } else {
                            prev.next = n;
                        }
                    };
                    CharSet.prototype.Clone = function () {
                        var s = new CharSet();
                        var prev = null;
                        for(var cur = this.head; cur != null; cur = cur.next) {
                            var r = new Range(cur.from, cur.to);
                            if(prev == null) {
                                s.head = r;
                            } else {
                                prev.next = r;
                            }
                            prev = r;
                        }
                        return s;
                    };
                    CharSet.prototype.Equals = function (s) {
                        var p = this.head;
                        var q = s.head;
                        while(p != null && q != null) {
                            if(p.from != q.from || p.to != q.to) {
                                return false;
                            }
                            p = p.next;
                            q = q.next;
                        }
                        return p == q;
                    };
                    CharSet.prototype.Elements = function () {
                        var n = 0;
                        for(var p = this.head; p != null; p = p.next) {
                            n += p.to - p.from + 1;
                        }
                        return n;
                    };
                    CharSet.prototype.First = function () {
                        if(this.head != null) {
                            return this.head.from;
                        }
                        return -1;
                    };
                    CharSet.prototype.Or = function (s) {
                        for(var p = s.head; p != null; p = p.next) {
                            for(var i = p.from; i <= p.to; i++) {
                                this.Set(i);
                            }
                        }
                    };
                    CharSet.prototype.And = function (s) {
                        var x = new CharSet();
                        for(var p = this.head; p != null; p = p.next) {
                            for(var i = p.from; i <= p.to; i++) {
                                if(s.get(i)) {
                                    x.Set(i);
                                }
                            }
                        }
                        this.head = x.head;
                    };
                    CharSet.prototype.Subtract = function (s) {
                        var x = new CharSet();
                        for(var p = this.head; p != null; p = p.next) {
                            for(var i = p.from; i <= p.to; i++) {
                                if(!s.get(i)) {
                                    x.Set(i);
                                }
                            }
                        }
                        this.head = x.head;
                    };
                    CharSet.prototype.Includes = function (s) {
                        for(var p = s.head; p != null; p = p.next) {
                            for(var i = p.from; i <= p.to; i++) {
                                if(!this.get(i)) {
                                    return false;
                                }
                            }
                        }
                        return true;
                    };
                    CharSet.prototype.Intersects = function (s) {
                        for(var p = s.head; p != null; p = p.next) {
                            for(var i = p.from; i <= p.to; i++) {
                                if(this.get(i)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    CharSet.prototype.Fill = function () {
                        this.head = new Range(0, 65535);
                    };
                    return CharSet;
                })();
                Coco.CharSet = CharSet;                
                var Generator = (function () {
                    function Generator(tab) {
                        this.EOF = -1;
                        this.tab = tab;
                    }
                    Generator.prototype.OpenFrame = function (frame) {
                        return this.fram;
                    };
                    Generator.prototype.OpenGen = function (target) {
                        return this.gen;
                    };
                    Generator.prototype.GenCopyright = function () {
                        var copyFr = null;
                    };
                    Generator.prototype.SkipFramePart = function (stop) {
                        this.CopyFramePart2(stop, false);
                    };
                    Generator.prototype.CopyFramePart = function (stop) {
                        this.CopyFramePart2(stop, true);
                    };
                    Generator.prototype.CopyFramePart2 = function (stop, generateOutput) {
                        var startCh = '\0000';
                        var endOfStopString = 0;
                        if(stop != null) {
                            startCh = stop[0];
                            endOfStopString = stop.length - 1;
                        }
                        var ch = this.framRead();
                        while(ch != Coco.Buffer.EOF) {
                            if(stop != null && ch == startCh) {
                                var i = 0;
                                do {
                                    if(i == endOfStopString) {
                                        return;
                                    }
                                    ch = this.framRead();
                                    i++;
                                }while(ch == stop[i]);
                                if(generateOutput) {
                                    this.gen.Write(stop.substring(0, i));
                                }
                            } else {
                                if(generateOutput) {
                                    this.gen.Write(ch);
                                }
                                ch = this.framRead();
                            }
                        }
                    };
                    Generator.prototype.framRead = function () {
                        try  {
                            return this.fram.ReadCharacter();
                        } catch (Exception) {
                        }
                    };
                    return Generator;
                })();
                Coco.Generator = Generator;                
                var DFA = (function () {
                    function DFA(parser) {
                        this.parser = parser;
                        this.tab = parser.tab;
                        this.errors = parser.errors;
                        this.trace = parser.trace;
                        this.firstState = null;
                        this.lastState = null;
                        this.lastStateNr = -1;
                        this.firstState = this.NewState();
                        this.firstMelted = null;
                        this.firstComment = null;
                        this.ignoreCase = false;
                        this.dirtyDFA = false;
                        this.hasCtxMoves = false;
                    }
                    DFA.Ch = function Ch(ch) {
                        var code = ch.charCodeAt(0);
                        if(ch < ' ' || code >= 127 || ch == '\'' || ch == '\\') {
                            return "\"\\u" + code.toString(16) + "\"";
                        } else {
                            return "'" + ch + "'";
                        }
                    };
                    DFA.Chn = function Chn(code) {
                        return "\"\\u" + code.toString(16) + "\"";
                    };
                    DFA.prototype.ChCond = function (ch) {
                        return "this.ch == " + DFA.Ch(ch);
                    };
                    DFA.prototype.ChCondn = function (ch) {
                        return "this.ch == " + DFA.Chn(ch);
                    };
                    DFA.prototype.PutRange = function (s) {
                        for(var r = s.head; r != null; r = r.next) {
                            if(r.from == r.to) {
                                this.gen.Write("this.ch == " + DFA.Chn(r.from));
                            } else if(r.from == 0) {
                                this.gen.Write("this.ch <= " + DFA.Chn(r.to));
                            } else {
                                this.gen.Write("this.ch >= " + DFA.Chn(r.from) + " && this.ch <= " + DFA.Chn(r.to));
                            }
                            if(r.next != null) {
                                this.gen.Write(" || ");
                            }
                        }
                    };
                    DFA.prototype.NewState = function () {
                        var s = new State();
                        s.nr = ++this.lastStateNr;
                        if(this.firstState == null) {
                            this.firstState = s;
                        } else {
                            this.lastState.next = s;
                        }
                        this.lastState = s;
                        return s;
                    };
                    DFA.prototype.NewTransition = function (from, to, typ, sym, tc) {
                        var t = new Target(to);
                        var a = new Action(typ, sym, tc);
                        a.target = t;
                        from.AddAction(a);
                        if(typ == Node.clas) {
                            this.curSy.tokenKind = Symbol.classToken;
                        }
                    };
                    DFA.prototype.CombineShifts = function () {
                        var state;
                        var a;
                        var b;
                        var c;
                        var seta;
                        var setb;
                        for(state = this.firstState; state != null; state = state.next) {
                            for(a = state.firstAction; a != null; a = a.next) {
                                b = a.next;
                                while(b != null) {
                                    if(a.target.state == b.target.state && a.tc == b.tc) {
                                        seta = a.Symbols(this.tab);
                                        setb = b.Symbols(this.tab);
                                        seta.Or(setb);
                                        a.ShiftWith(seta, this.tab);
                                        c = b;
                                        b = b.next;
                                        state.DetachAction(c);
                                    } else {
                                        b = b.next;
                                    }
                                }
                            }
                        }
                    };
                    DFA.prototype.FindUsedStates = function (state, used) {
                        if(used[state.nr]) {
                            return;
                        }
                        used[state.nr] = true;
                        for(var a = state.firstAction; a != null; a = a.next) {
                            this.FindUsedStates(a.target.state, used);
                        }
                    };
                    DFA.prototype.DeleteRedundantStates = function () {
                        var newState = new State[this.lastStateNr + 1]();
                        var used = new BitArray(this.lastStateNr + 1);
                        this.FindUsedStates(this.firstState, used);
                        for(var s1 = this.firstState.next; s1 != null; s1 = s1.next) {
                            if(used[s1.nr] && s1.endOf != null && s1.firstAction == null && !s1.ctx) {
                                for(var s2 = s1.next; s2 != null; s2 = s2.next) {
                                    if(used[s2.nr] && s1.endOf == s2.endOf && s2.firstAction == null && !s2.ctx) {
                                        used[s2.nr] = false;
                                        newState[s2.nr] = s1;
                                    }
                                }
                            }
                        }
                        for(var state = this.firstState; state != null; state = state.next) {
                            if(used[state.nr]) {
                                for(var a = state.firstAction; a != null; a = a.next) {
                                    if(!used[a.target.state.nr]) {
                                        a.target.state = newState[a.target.state.nr];
                                    }
                                }
                            }
                        }
                        this.lastState = this.firstState;
                        this.lastStateNr = 0;
                        for(var state = this.firstState.next; state != null; state = state.next) {
                            if(used[state.nr]) {
                                state.nr = ++this.lastStateNr;
                                this.lastState = state;
                            } else {
                                this.lastState.next = state.next;
                            }
                        }
                    };
                    DFA.prototype.TheState = function (p) {
                        var state;
                        if(p == null) {
                            state = this.NewState();
                            state.endOf = this.curSy;
                            return state;
                        } else {
                            return p.state;
                        }
                    };
                    DFA.prototype.Step = function (from, p, stepped) {
                        if(p == null) {
                            return;
                        }
                        stepped[p.n] = true;
                        switch(p.typ) {
                            case Node.clas:
                            case Node.chr: {
                                this.NewTransition(from, this.TheState(p.next), p.typ, p.val, p.code);
                                break;
                            }
                            case Node.alt: {
                                this.Step(from, p.sub, stepped);
                                this.Step(from, p.down, stepped);
                                break;
                            }
                            case Node.iter: {
                                if(Tab.DelSubGraph(p.sub)) {
                                    this.parser.SemErr("contents of {...} must not be deletable");
                                    return;
                                }
                                if(p.next != null && !stepped[p.next.n]) {
                                    this.Step(from, p.next, stepped);
                                }
                                this.Step(from, p.sub, stepped);
                                if(p.state != from) {
                                    this.Step(p.state, p, new BitArray(this.tab.nodes.Count));
                                }
                                break;
                            }
                            case Node.opt: {
                                if(p.next != null && !stepped[p.next.n]) {
                                    this.Step(from, p.next, stepped);
                                }
                                this.Step(from, p.sub, stepped);
                                break;
                            }
                        }
                    };
                    DFA.prototype.NumberNodes = function (p, state, renumIter) {
                        if(p == null) {
                            return;
                        }
                        if(p.state != null) {
                            return;
                        }
                        if(state == null || (p.typ == Node.iter && renumIter)) {
                            state = this.NewState();
                        }
                        p.state = state;
                        if(Tab.DelGraph(p)) {
                            state.endOf = this.curSy;
                        }
                        switch(p.typ) {
                            case Node.clas:
                            case Node.chr: {
                                this.NumberNodes(p.next, null, false);
                                break;
                            }
                            case Node.opt: {
                                this.NumberNodes(p.next, null, false);
                                this.NumberNodes(p.sub, state, true);
                                break;
                            }
                            case Node.iter: {
                                this.NumberNodes(p.next, state, true);
                                this.NumberNodes(p.sub, state, true);
                                break;
                            }
                            case Node.alt: {
                                this.NumberNodes(p.next, null, false);
                                this.NumberNodes(p.sub, state, true);
                                this.NumberNodes(p.down, state, renumIter);
                                break;
                            }
                        }
                    };
                    DFA.prototype.FindTrans = function (p, start, marked) {
                        if(p == null || marked[p.n]) {
                            return;
                        }
                        marked[p.n] = true;
                        if(start) {
                            this.Step(p.state, p, new BitArray(this.tab.nodes.Count));
                        }
                        switch(p.typ) {
                            case Node.clas:
                            case Node.chr: {
                                this.FindTrans(p.next, true, marked);
                                break;
                            }
                            case Node.opt: {
                                this.FindTrans(p.next, true, marked);
                                this.FindTrans(p.sub, false, marked);
                                break;
                            }
                            case Node.iter: {
                                this.FindTrans(p.next, false, marked);
                                this.FindTrans(p.sub, false, marked);
                                break;
                            }
                            case Node.alt: {
                                this.FindTrans(p.sub, false, marked);
                                this.FindTrans(p.down, false, marked);
                                break;
                            }
                        }
                    };
                    DFA.prototype.ConvertToStates = function (p, sym) {
                        this.curSy = sym;
                        if(Tab.DelGraph(p)) {
                            this.parser.SemErr("token might be empty");
                            return;
                        }
                        this.NumberNodes(p, this.firstState, true);
                        this.FindTrans(p, true, new BitArray(this.tab.nodes.Count));
                        if(p.typ == Node.iter) {
                            this.Step(this.firstState, p, new BitArray(this.tab.nodes.Count));
                        }
                    };
                    DFA.prototype.MatchLiteral = function (s, sym) {
                        s = this.tab.Unescape(s.substring(1, s.length - 2));
                        var i;
                        var len = s.length;
                        var state = this.firstState;
                        var a = null;
                        for(i = 0; i < len; i++) {
                            a = this.FindAction(state, s[i]);
                            if(a == null) {
                                break;
                            }
                            state = a.target.state;
                        }
                        if(i != len || state.endOf == null) {
                            state = this.firstState;
                            i = 0;
                            a = null;
                            this.dirtyDFA = true;
                        }
                        for(; i < len; i++) {
                            var to = this.NewState();
                            this.NewTransition(state, to, Node.chr, s[i], Node.normalTrans);
                            state = to;
                        }
                        var matchedSym = state.endOf;
                        if(state.endOf == null) {
                            state.endOf = sym;
                        } else if(matchedSym.tokenKind == Symbol.fixedToken || (a != null && a.tc == Node.contextTrans)) {
                            this.parser.SemErr("tokens " + sym.name + " and " + matchedSym.name + " cannot be distinguished");
                        } else {
                            matchedSym.tokenKind = Symbol.classLitToken;
                            sym.tokenKind = Symbol.litToken;
                        }
                    };
                    DFA.prototype.SplitActions = function (state, a, b) {
                        var c;
                        var seta;
                        var setb;
                        var setc;
                        seta = a.Symbols(this.tab);
                        setb = b.Symbols(this.tab);
                        if(seta.Equals(setb)) {
                            a.AddTargets(b);
                            state.DetachAction(b);
                        } else if(seta.Includes(setb)) {
                            setc = seta.Clone();
                            setc.Subtract(setb);
                            b.AddTargets(a);
                            a.ShiftWith(setc, this.tab);
                        } else if(setb.Includes(seta)) {
                            setc = setb.Clone();
                            setc.Subtract(seta);
                            a.AddTargets(b);
                            b.ShiftWith(setc, this.tab);
                        } else {
                            setc = seta.Clone();
                            setc.And(setb);
                            seta.Subtract(setc);
                            setb.Subtract(setc);
                            a.ShiftWith(seta, this.tab);
                            b.ShiftWith(setb, this.tab);
                            c = new Action(0, 0, Node.normalTrans);
                            c.AddTargets(a);
                            c.AddTargets(b);
                            c.ShiftWith(setc, this.tab);
                            state.AddAction(c);
                        }
                    };
                    DFA.prototype.Overlap = function (a, b) {
                        var seta;
                        var setb;
                        if(a.typ == Node.chr) {
                            if(b.typ == Node.chr) {
                                return a.sym == b.sym;
                            } else {
                                setb = this.tab.CharClassSet(b.sym);
                                return setb[a.sym];
                            }
                        } else {
                            seta = this.tab.CharClassSet(a.sym);
                            if(b.typ == Node.chr) {
                                return seta[b.sym];
                            } else {
                                setb = this.tab.CharClassSet(b.sym);
                                return seta.Intersects(setb);
                            }
                        }
                    };
                    DFA.prototype.MakeUnique = function (state) {
                        var changed;
                        do {
                            changed = false;
                            for(var a = state.firstAction; a != null; a = a.next) {
                                for(var b = a.next; b != null; b = b.next) {
                                    if(this.Overlap(a, b)) {
                                        this.SplitActions(state, a, b);
                                        changed = true;
                                    }
                                }
                            }
                        }while(changed);
                    };
                    DFA.prototype.MeltStates = function (state) {
                        var ctx;
                        var targets;
                        var endOf;
                        for(var action = state.firstAction; action != null; action = action.next) {
                            if(action.target.next != null) {
                                var gts = this.GetTargetStates(action);
                                targets = gts.targets;
                                endOf = gts.endOf;
                                ctx = gts.ctx;
                                var melt = this.StateWithSet(targets);
                                if(melt == null) {
                                    var s = this.NewState();
                                    s.endOf = endOf;
                                    s.ctx = ctx;
                                    for(var targ = action.target; targ != null; targ = targ.next) {
                                        s.MeltWith(targ.state);
                                    }
                                    this.MakeUnique(s);
                                    melt = this.NewMelted(targets, s);
                                }
                                action.target.next = null;
                                action.target.state = melt.state;
                            }
                        }
                    };
                    DFA.prototype.FindCtxStates = function () {
                        for(var state = this.firstState; state != null; state = state.next) {
                            for(var a = state.firstAction; a != null; a = a.next) {
                                if(a.tc == Node.contextTrans) {
                                    a.target.state.ctx = true;
                                }
                            }
                        }
                    };
                    DFA.prototype.MakeDeterministic = function () {
                        var state;
                        this.lastSimState = this.lastState.nr;
                        this.maxStates = 2 * this.lastSimState;
                        this.FindCtxStates();
                        for(state = this.firstState; state != null; state = state.next) {
                            this.MakeUnique(state);
                        }
                        for(state = this.firstState; state != null; state = state.next) {
                            this.MeltStates(state);
                        }
                        this.DeleteRedundantStates();
                        this.CombineShifts();
                    };
                    DFA.prototype.PrintStates = function () {
                        this.trace.WriteLine();
                        this.trace.WriteLineText("---------- states ----------");
                        for(var state = this.firstState; state != null; state = state.next) {
                            var first = true;
                            if(state.endOf == null) {
                                this.trace.Write("               ");
                            } else {
                                this.trace.WriteFormatted1("E({0,12})", this.tab.Name(state.endOf.name));
                            }
                            this.trace.WriteFormatted1("{0,3}:", state.nr);
                            if(state.firstAction == null) {
                                this.trace.WriteLine();
                            }
                            for(var action = state.firstAction; action != null; action = action.next) {
                                if(first) {
                                    this.trace.Write(" ");
                                    first = false;
                                } else {
                                    this.trace.Write("                    ");
                                }
                                if(action.typ == Node.clas) {
                                    this.trace.Write(this.tab.classes[action.sym].name);
                                } else {
                                    this.trace.WriteFormatted1("{0, 3}", DFA.Chn(action.sym));
                                }
                                for(var targ = action.target; targ != null; targ = targ.next) {
                                    this.trace.WriteFormatted1(" {0, 3}", targ.state.nr);
                                }
                                if(action.tc == Node.contextTrans) {
                                    this.trace.WriteLineText(" context");
                                } else {
                                    this.trace.WriteLine();
                                }
                            }
                        }
                        this.trace.WriteLine();
                        this.trace.WriteLineText("---------- character classes ----------");
                        this.tab.WriteCharClasses();
                    };
                    DFA.prototype.FindAction = function (state, ch) {
                        for(var a = state.firstAction; a != null; a = a.next) {
                            if(a.typ == Node.chr && ch.charCodeAt(0) == a.sym) {
                                return a;
                            } else if(a.typ == Node.clas) {
                                var s = this.tab.CharClassSet(a.sym);
                                if(s[ch]) {
                                    return a;
                                }
                            }
                        }
                        return null;
                    };
                    DFA.prototype.GetTargetStates = function (a) {
                        var ret;
                        ret.endOf = null;
                        ret.ctx = false;
                        ret.targets = new BitArray(this.maxStates);
                        for(var t = a.target; t != null; t = t.next) {
                            var stateNr = t.state.nr;
                            if(stateNr <= this.lastSimState) {
                                ret.targets[stateNr] = true;
                            } else {
                                ret.targets.Or(this.MeltedSet(stateNr));
                            }
                            if(t.state.endOf != null) {
                                if(ret.endOf == null || ret.endOf == t.state.endOf) {
                                    ret.endOf = t.state.endOf;
                                } else {
                                    this.errors.SemErr("Tokens " + ret.endOf.name + " and " + t.state.endOf.name + " cannot be distinguished");
                                }
                            }
                            if(t.state.ctx) {
                                ret.ctx = true;
                            }
                        }
                        return ret;
                    };
                    DFA.prototype.NewMelted = function (set, state) {
                        var m = new Melted(set, state);
                        m.next = this.firstMelted;
                        this.firstMelted = m;
                        return m;
                    };
                    DFA.prototype.MeltedSet = function (nr) {
                        var m = this.firstMelted;
                        while(m != null) {
                            if(m.state.nr == nr) {
                                return m.set;
                            } else {
                                m = m.next;
                            }
                        }
                    };
                    DFA.prototype.StateWithSet = function (s) {
                        for(var m = this.firstMelted; m != null; m = m.next) {
                            if(Sets.Equals(s, m.set)) {
                                return m;
                            }
                        }
                        return null;
                    };
                    DFA.prototype.CommentStr = function (p) {
                        var s = new StringBuilder("");
                        while(p != null) {
                            if(p.typ == Node.chr) {
                                s.AppendNumber(p.val);
                            } else if(p.typ == Node.clas) {
                                var set = this.tab.CharClassSet(p.val);
                                if(set.Elements() != 1) {
                                    this.parser.SemErr("character set contains more than 1 character");
                                }
                                s.AppendNumber(set.First());
                            } else {
                                this.parser.SemErr("comment delimiters may not be structured");
                            }
                            p = p.next;
                        }
                        if(s.length == 0 || s.length > 2) {
                            this.parser.SemErr("comment delimiters must be 1 or 2 characters long");
                            s = new StringBuilder("?");
                        }
                        return s.toString();
                    };
                    DFA.prototype.NewComment = function (from, to, nested) {
                        var c = new Comment(this.CommentStr(from), this.CommentStr(to), nested);
                        c.next = this.firstComment;
                        this.firstComment = c;
                    };
                    DFA.prototype.GenComBody = function (com) {
                        this.gen.WriteLineText("\t\t\tfor(;;) {");
                        this.gen.WriteFormatted1("\t\t\t\tif ({0}) ", this.ChCond(com.stop[0]));
                        this.gen.WriteLineText("{");
                        if(com.stop.length == 1) {
                            this.gen.WriteLineText("\t\t\t\t\tlevel--;");
                            this.gen.WriteLineText("\t\t\t\t\tif (level == 0) { this.oldEols = this.line - line0; this.NextCh(); return true; }");
                            this.gen.WriteLineText("\t\t\t\t\tthis.NextCh();");
                        } else {
                            this.gen.WriteLineText("\t\t\t\t\tthis.NextCh();");
                            this.gen.WriteLineFormatted1("\t\t\t\t\tif ({0}) {{", this.ChCond(com.stop[1]));
                            this.gen.WriteLineText("\t\t\t\t\t\tlevel--;");
                            this.gen.WriteLineText("\t\t\t\t\t\tif (level == 0) { this.oldEols = this.line - line0; this.NextCh(); return true; }");
                            this.gen.WriteLineText("\t\t\t\t\t\tthis.NextCh();");
                            this.gen.WriteLineText("\t\t\t\t\t}");
                        }
                        if(com.nested) {
                            this.gen.Write("\t\t\t\t}");
                            this.gen.WriteFormatted1(" else if ({0}) ", this.ChCond(com.start[0]));
                            this.gen.WriteLineText("{");
                            if(com.start.length == 1) {
                                this.gen.WriteLineText("\t\t\t\t\tlevel++; this.NextCh();");
                            } else {
                                this.gen.WriteLineText("\t\t\t\t\tthis.NextCh();");
                                this.gen.WriteFormatted1("\t\t\t\t\tif ({0}) ", this.ChCond(com.start[1]));
                                this.gen.WriteLineText("{");
                                this.gen.WriteLineText("\t\t\t\t\t\tlevel++; this.NextCh();");
                                this.gen.WriteLineText("\t\t\t\t\t}");
                            }
                        }
                        this.gen.WriteLineText("\t\t\t\t} else if (this.ch == Buffer.EOF) return false;");
                        this.gen.WriteLineText("\t\t\t\telse this.NextCh();");
                        this.gen.WriteLineText("\t\t\t}");
                    };
                    DFA.prototype.GenComment = function (com, i) {
                        this.gen.WriteLine();
                        this.gen.WriteFormatted1("\tComment{0}() : bool", i);
                        this.gen.WriteLineText("{");
                        this.gen.WriteLineText("\t\tvar level = 1; var pos0 = this.pos; var line0 = this.line; var col0 = this.col; var charPos0 = this.charPos;");
                        if(com.start.length == 1) {
                            this.gen.WriteLineText("\t\tthis.NextCh();");
                            this.GenComBody(com);
                        } else {
                            this.gen.WriteLineText("\t\tthis.NextCh();");
                            this.gen.WriteFormatted1("\t\tif ({0}) ", this.ChCond(com.start[1]));
                            this.gen.WriteLineText("{");
                            this.gen.WriteLineText("\t\t\tthis.NextCh();");
                            this.GenComBody(com);
                            this.gen.WriteLineText("\t\t} else {");
                            this.gen.WriteLineText("\t\t\tthis.buffer.Pos = pos0; this.NextCh(); this.line = line0; this.col = col0; this.charPos = charPos0;");
                            this.gen.WriteLineText("\t\t}");
                            this.gen.WriteLineText("\t\treturn false;");
                        }
                        this.gen.WriteLineText("\t}");
                    };
                    DFA.prototype.SymName = function (sym) {
                        if(isLetter(sym.name[0])) {
                            for(var i = 0; i < this.tab.literals.length; i++) {
                                var e = this.tab.literals[i];
                                if(e.Value == sym) {
                                    return e.Key;
                                }
                            }
                        }
                        return sym.name;
                    };
                    DFA.prototype.GenLiterals = function () {
                        if(this.ignoreCase) {
                            this.gen.WriteLineText("\t\tswitch (this.t.val.ToLower()) {");
                        } else {
                            this.gen.WriteLineText("\t\tswitch (this.t.val) {");
                        }
                        var allSym = this.tab.terminals.concat(this.tab.pragmas);
                        for(var i = 0; i < allSym.length; i++) {
                            var sym = allSym[i];
                            if(sym.tokenKind == Symbol.litToken) {
                                var name = this.SymName(sym);
                                if(this.ignoreCase) {
                                    name = name.toLowerCase();
                                }
                                this.gen.WriteLineFormatted2("\t\t\tcase {0}: this.t.kind = {1}; break;", name, sym.n);
                            }
                        }
                        this.gen.WriteLineText("\t\t\tdefault: break;");
                        this.gen.Write("\t\t}");
                    };
                    DFA.prototype.WriteState = function (state) {
                        var endOf = state.endOf;
                        this.gen.WriteLineFormatted1("\t\t\tcase {0}:", state.nr);
                        if(endOf != null && state.firstAction != null) {
                            this.gen.WriteLineFormatted1("\t\t\t\trecEnd = this.pos; recKind = {0};", endOf.n);
                        }
                        var ctxEnd = state.ctx;
                        for(var action = state.firstAction; action != null; action = action.next) {
                            if(action == state.firstAction) {
                                this.gen.Write("\t\t\t\tif (");
                            } else {
                                this.gen.Write("\t\t\t\telse if (");
                            }
                            if(action.typ == Node.chr) {
                                this.gen.Write(this.ChCondn(action.sym));
                            } else {
                                this.PutRange(this.tab.CharClassSet(action.sym));
                            }
                            this.gen.Write(") {");
                            if(action.tc == Node.contextTrans) {
                                this.gen.Write("apx++; ");
                                ctxEnd = false;
                            } else if(state.ctx) {
                                this.gen.Write("apx = 0; ");
                            }
                            this.gen.WriteFormatted1("this.AddCh(); state = {0}; done = false; break;", action.target.state.nr);
                            this.gen.WriteLineText("}");
                        }
                        if(state.firstAction == null) {
                            this.gen.Write("\t\t\t\t{");
                        } else {
                            this.gen.Write("\t\t\t\telse {");
                        }
                        if(ctxEnd) {
                            this.gen.WriteLine();
                            this.gen.WriteLineText("\t\t\t\t\ttlen -= apx;");
                            this.gen.WriteLineText("\t\t\t\t\tthis.SetScannerBehindT();");
                            this.gen.Write("\t\t\t\t\t");
                        }
                        if(endOf == null) {
                            this.gen.WriteLineText("state = 0; done = false; break;}");
                        } else {
                            this.gen.WriteFormatted1("this.t.kind = {0}; ", endOf.n);
                            if(endOf.tokenKind == Symbol.classLitToken) {
                                this.gen.WriteLineText("this.t.val = this.tval.join(\"\"); this.CheckLiteral(); return this.t;}");
                            } else {
                                this.gen.WriteLineText("break;}");
                            }
                        }
                    };
                    DFA.prototype.WriteStartTab = function () {
                        for(var action = this.firstState.firstAction; action != null; action = action.next) {
                            var targetState = action.target.state.nr;
                            if(action.typ == Node.chr) {
                                var c = String.fromCharCode(action.sym);
                                this.gen.WriteLineText("\t\tstart['" + c + "'] = " + targetState + "; ");
                            } else {
                                var s = this.tab.CharClassSet(action.sym);
                                for(var r = s.head; r != null; r = r.next) {
                                    this.gen.WriteLineText("\t\tfor (var i : number = " + r.from + "; i <= " + r.to + "; ++i) start[String.fromCharCode(i)] = " + targetState + ";");
                                }
                            }
                        }
                        this.gen.WriteLineText("\t\tstart[Buffer.EOF] = -1;");
                    };
                    DFA.prototype.WriteScanner = function () {
                        var g = new Generator(this.tab);
                        this.fram = g.OpenFrame("Scanner.frame");
                        this.gen = g.OpenGen("Scanner.ts");
                        if(this.dirtyDFA) {
                            this.MakeDeterministic();
                        }
                        g.GenCopyright();
                        g.SkipFramePart("-->begin");
                        g.CopyFramePart("-->namespace");
                        if(this.tab.nsName != null && this.tab.nsName.length > 0) {
                            this.gen.Write("module ");
                            this.gen.Write(this.tab.nsName);
                            this.gen.Write(" {");
                        }
                        g.CopyFramePart("-->declarations");
                        this.gen.WriteLineFormatted1("\tstatic maxT : number = {0};", this.tab.terminals.length - 1);
                        this.gen.WriteLineFormatted1("\tstatic noSym : number = {0};", this.tab.noSym.n);
                        if(this.ignoreCase) {
                            this.gen.Write("\tstatic valCh : string;       // current input character (for token.val)");
                        }
                        g.CopyFramePart("-->initialization");
                        this.WriteStartTab();
                        g.CopyFramePart("-->casing1");
                        if(this.ignoreCase) {
                            this.gen.WriteLineText("\t\tif (ch != Buffer.EOF) {");
                            this.gen.WriteLineText("\t\t\tvalCh = ch;");
                            this.gen.WriteLineText("\t\t\tch = ch.toLowerCase();");
                            this.gen.WriteLineText("\t\t}");
                        }
                        g.CopyFramePart("-->casing2");
                        this.gen.Write("\t\t\tthis.tval.push(");
                        if(this.ignoreCase) {
                            this.gen.Write("this.valCh");
                        } else {
                            this.gen.Write("this.ch");
                        }
                        this.gen.WriteLineText(");");
                        g.CopyFramePart("-->comments");
                        var com = this.firstComment;
                        var comIdx = 0;
                        while(com != null) {
                            this.GenComment(com, comIdx);
                            com = com.next;
                            comIdx++;
                        }
                        g.CopyFramePart("-->literals");
                        this.GenLiterals();
                        g.CopyFramePart("-->scan1");
                        this.gen.Write("\t\t\t");
                        if(this.tab.ignored.Elements() > 0) {
                            this.PutRange(this.tab.ignored);
                        } else {
                            this.gen.Write("false");
                        }
                        g.CopyFramePart("-->scan2");
                        if(this.firstComment != null) {
                            this.gen.Write("\t\tif (");
                            com = this.firstComment;
                            comIdx = 0;
                            while(com != null) {
                                this.gen.Write(this.ChCond(com.start[0]));
                                this.gen.WriteFormatted1(" && this.Comment{0}()", comIdx);
                                if(com.next != null) {
                                    this.gen.Write(" ||");
                                }
                                com = com.next;
                                comIdx++;
                            }
                            this.gen.Write(") return this.NextToken();");
                        }
                        if(this.hasCtxMoves) {
                            this.gen.WriteLine();
                            this.gen.Write("\t\tvar apx : number = 0;");
                        }
                        g.CopyFramePart("-->scan3");
                        for(var state = this.firstState.next; state != null; state = state.next) {
                            this.WriteState(state);
                        }
                        g.CopyFramePart(null);
                        if(this.tab.nsName != null && this.tab.nsName.length > 0) {
                            this.gen.Write("}");
                        }
                        this.gen.Close();
                    };
                    return DFA;
                })();
                Coco.DFA = DFA;                
            })(ssw.Coco || (ssw.Coco = {}));
            var Coco = ssw.Coco;
        })(jku.ssw || (jku.ssw = {}));
        var ssw = jku.ssw;
    })(at.jku || (at.jku = {}));
    var jku = at.jku;
})(at || (at = {}));